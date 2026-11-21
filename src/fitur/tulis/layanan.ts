// Draf tulisan oleh Blogger lewat web. Hanya pemilik yang boleh mengubah drafnya sendiri.
import { randomBytes } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { rubrik, tulisan } from '@/lib/db/schema';
import { catatAudit } from '@/lib/audit';
import type { Peran } from '@/lib/izin';
import { ubahStatus } from '@/fitur/tulisan/layanan';
import type { StatusTulisan } from '@/fitur/tulisan/alur-status';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export const ISI_MINIMAL_AJUKAN = 100;

export const skemaDraf = z.object({
  judul: z.string().trim().min(5, 'Judul minimal 5 karakter.').max(120, 'Judul maksimal 120 karakter.'),
  rubrikSlug: z.string().trim().min(1, 'Pilih rubrik.'),
  isi: z.string().max(20000, 'Isi maksimal 20.000 karakter.'),
  tenggat: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tenggat tidak valid.').optional(),
});

export interface Penulis {
  userId: string;
  nama: string;
  peran: Peran;
}

export type HasilTulis = { ok: true; id?: string } | { ok: false; pesan: string };

export function buatSlug(judul: string, acak: string = randomBytes(3).toString('hex')): string {
  const dasar = judul
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return `${dasar || 'tulisan'}-${acak}`;
}

function tenggatBawaan(): string {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export interface TulisanSaya {
  id: string;
  judul: string;
  isi: string;
  rubrikSlug: string;
  rubrik: string;
  status: StatusTulisan;
  tenggat: string;
}

export async function ambilRubrikPilihan(db: Db): Promise<{ slug: string; nama: string }[]> {
  return db.select({ slug: rubrik.slug, nama: rubrik.nama }).from(rubrik).orderBy(rubrik.nama);
}

export async function ambilTulisanSaya(db: Db, userId: string): Promise<TulisanSaya[]> {
  const baris = await db
    .select({
      id: tulisan.id,
      judul: tulisan.judul,
      isi: tulisan.isi,
      rubrikSlug: tulisan.rubrikSlug,
      rubrik: rubrik.nama,
      status: tulisan.status,
      tenggat: tulisan.tenggat,
    })
    .from(tulisan)
    .innerJoin(rubrik, eq(tulisan.rubrikSlug, rubrik.slug))
    .where(eq(tulisan.penulisId, userId))
    .orderBy(desc(tulisan.dibuatPada));
  return baris.map((b: any) => ({ ...b, status: b.status as StatusTulisan }));
}

async function rubrikAda(db: Db, slug: string): Promise<boolean> {
  const [r] = await db.select({ slug: rubrik.slug }).from(rubrik).where(eq(rubrik.slug, slug));
  return Boolean(r);
}

export async function buatDraf(db: Db, penulis: Penulis, input: unknown): Promise<HasilTulis> {
  const hasil = skemaDraf.safeParse(input);
  if (!hasil.success) return { ok: false, pesan: hasil.error.issues[0]?.message ?? 'Data belum lengkap.' };
  const d = hasil.data;
  try {
    if (!(await rubrikAda(db, d.rubrikSlug))) return { ok: false, pesan: 'Rubrik tidak ditemukan.' };
    const [baru] = await db
      .insert(tulisan)
      .values({
        slug: buatSlug(d.judul),
        judul: d.judul,
        isi: d.isi,
        rubrikSlug: d.rubrikSlug,
        status: 'draf',
        penanggung: [penulis.nama],
        tenggat: d.tenggat ?? tenggatBawaan(),
        penulisId: penulis.userId,
      })
      .returning({ id: tulisan.id });
    await catatAudit(db, { peran: penulis.peran, aksi: 'buat_draf', objek: 'tulisan', objekId: baru.id });
    return { ok: true, id: baru.id };
  } catch {
    return { ok: false, pesan: 'Draf belum tersimpan. Coba lagi beberapa saat lagi.' };
  }
}

async function ambilMilik(db: Db, id: string, userId: string) {
  const [t] = await db
    .select({ id: tulisan.id, status: tulisan.status, isi: tulisan.isi })
    .from(tulisan)
    .where(and(eq(tulisan.id, id), eq(tulisan.penulisId, userId)));
  return t as { id: string; status: StatusTulisan; isi: string } | undefined;
}

export async function simpanDraf(db: Db, penulis: Penulis, id: string, input: unknown): Promise<HasilTulis> {
  const hasil = skemaDraf.safeParse(input);
  if (!hasil.success) return { ok: false, pesan: hasil.error.issues[0]?.message ?? 'Data belum lengkap.' };
  const d = hasil.data;
  try {
    const t = await ambilMilik(db, id, penulis.userId);
    if (!t) return { ok: false, pesan: 'Tulisan tidak ditemukan.' };
    if (t.status !== 'draf') return { ok: false, pesan: 'Hanya tulisan berstatus draf yang bisa diubah.' };
    if (!(await rubrikAda(db, d.rubrikSlug))) return { ok: false, pesan: 'Rubrik tidak ditemukan.' };
    await db
      .update(tulisan)
      .set({ judul: d.judul, isi: d.isi, rubrikSlug: d.rubrikSlug, ...(d.tenggat ? { tenggat: d.tenggat } : {}), diperbarui: new Date() })
      .where(eq(tulisan.id, id));
    await catatAudit(db, { peran: penulis.peran, aksi: 'ubah_draf', objek: 'tulisan', objekId: id });
    return { ok: true };
  } catch {
    return { ok: false, pesan: 'Perubahan belum tersimpan. Coba lagi.' };
  }
}

/** Mengajukan draf ke desain (draf menjadi menunggu_desain). Aturan status tetap di pindahStatus. */
export async function ajukanDraf(db: Db, penulis: Penulis, id: string): Promise<HasilTulis> {
  try {
    const t = await ambilMilik(db, id, penulis.userId);
    if (!t) return { ok: false, pesan: 'Tulisan tidak ditemukan.' };
    if (t.status !== 'draf') return { ok: false, pesan: 'Tulisan ini sudah diajukan.' };
    if (t.isi.trim().length < ISI_MINIMAL_AJUKAN) {
      return { ok: false, pesan: `Isi tulisan minimal ${ISI_MINIMAL_AJUKAN} karakter sebelum diajukan.` };
    }
    const hasil = await ubahStatus(db, { id, ke: 'menunggu_desain', peran: penulis.peran });
    return hasil.ok ? { ok: true } : hasil;
  } catch {
    return { ok: false, pesan: 'Pengajuan belum tersimpan. Coba lagi.' };
  }
}
