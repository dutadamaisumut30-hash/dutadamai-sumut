// Komentar publik dan tulisan terbit dari database. Komentar baru berstatus menunggu sampai ditinjau redaksi.
import { and, desc, eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { komentar, rubrik, tulisan } from '@/lib/db/schema';
import { catatAudit } from '@/lib/audit';
import type { Peran } from '@/lib/izin';
import { pindahKomentar, type StatusKomentar } from '@/fitur/moderasi/komentar';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export const skemaKomentar = z.object({
  nama: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(60, 'Nama maksimal 60 karakter.'),
  isi: z.string().trim().min(5, 'Komentar minimal 5 karakter.').max(1000, 'Komentar maksimal 1000 karakter.'),
});

export interface TulisanTerbit {
  id: string;
  slug: string;
  judul: string;
  isi: string;
  rubrik: string;
  penanggung: string[];
  tenggat: string;
}

export async function ambilTerbit(db: Db, slug: string): Promise<TulisanTerbit | null> {
  try {
    const [b] = await db
      .select({
        id: tulisan.id,
        slug: tulisan.slug,
        judul: tulisan.judul,
        isi: tulisan.isi,
        rubrik: rubrik.nama,
        penanggung: tulisan.penanggung,
        tenggat: tulisan.tenggat,
      })
      .from(tulisan)
      .innerJoin(rubrik, eq(tulisan.rubrikSlug, rubrik.slug))
      .where(and(eq(tulisan.slug, slug), eq(tulisan.status, 'terbit')));
    return b ?? null;
  } catch {
    return null;
  }
}

export async function ambilKomentarTampil(db: Db, tulisanId: string) {
  return db
    .select({ id: komentar.id, nama: komentar.namaPengirim, isi: komentar.isi, dibuatPada: komentar.dibuatPada })
    .from(komentar)
    .where(and(eq(komentar.tulisanId, tulisanId), eq(komentar.status, 'tampil')))
    .orderBy(desc(komentar.dibuatPada));
}

export async function kirimKomentar(
  db: Db,
  tulisanId: string,
  input: unknown,
): Promise<{ ok: true } | { ok: false; pesan: string }> {
  const hasil = skemaKomentar.safeParse(input);
  if (!hasil.success) return { ok: false, pesan: hasil.error.issues[0]?.message ?? 'Data belum lengkap.' };
  try {
    const [baru] = await db
      .insert(komentar)
      .values({ tulisanId, namaPengirim: hasil.data.nama, isi: hasil.data.isi })
      .returning({ id: komentar.id });
    await catatAudit(db, { peran: 'publik', aksi: 'kirim_komentar', objek: 'komentar', objekId: baru?.id ?? null });
    return { ok: true };
  } catch {
    return { ok: false, pesan: 'Komentarmu belum tersimpan. Coba lagi beberapa saat lagi.' };
  }
}

export interface KomentarModerasi {
  id: string;
  nama: string;
  isi: string;
  status: StatusKomentar;
  laporan: number;
  judul: string;
  slug: string;
  diterima: string;
  tulisanTerbit: boolean;
}

export async function ambilSemuaKomentar(db: Db): Promise<KomentarModerasi[]> {
  const baris = await db
    .select({
      id: komentar.id,
      nama: komentar.namaPengirim,
      isi: komentar.isi,
      status: komentar.status,
      laporan: komentar.laporan,
      judul: tulisan.judul,
      slug: tulisan.slug,
      statusTulisan: tulisan.status,
      dibuatPada: komentar.dibuatPada,
    })
    .from(komentar)
    .innerJoin(tulisan, eq(komentar.tulisanId, tulisan.id))
    .orderBy(desc(komentar.laporan), desc(komentar.dibuatPada));
  return baris.map(({ statusTulisan, dibuatPada, ...b }) => ({
    ...b,
    status: b.status as StatusKomentar,
    tulisanTerbit: statusTulisan === 'terbit',
    diterima: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(dibuatPada),
  }));
}

export async function ubahStatusKomentar(
  db: Db,
  id: string,
  ke: StatusKomentar,
  peran: Peran,
): Promise<{ ok: true } | { ok: false; pesan: string }> {
  try {
    const [k] = await db.select({ status: komentar.status }).from(komentar).where(eq(komentar.id, id));
    if (!k) return { ok: false, pesan: 'Komentar tidak ditemukan.' };
    const dari = k.status as StatusKomentar;
    const hasil = pindahKomentar({ dari, ke, peran });
    if (!hasil.ok) return { ok: false, pesan: hasil.alasan };
    await db.update(komentar).set({ status: ke }).where(eq(komentar.id, id));
    await catatAudit(db, { peran, aksi: 'moderasi_komentar', objek: 'komentar', objekId: id, catatan: `${dari} -> ${ke}` });
    return { ok: true };
  } catch {
    return { ok: false, pesan: 'Status belum tersimpan. Coba lagi beberapa saat lagi.' };
  }
}
