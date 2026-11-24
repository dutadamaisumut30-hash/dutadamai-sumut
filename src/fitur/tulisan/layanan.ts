// Logika papan redaksi di database. Aturan perpindahan tetap di alur-status.ts.
import { desc, eq, inArray } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { logAudit, rubrik, tulisan } from '@/lib/db/schema';
import { catatAudit } from '@/lib/audit';
import type { Peran } from '@/lib/izin';
import { pindahStatus, type StatusTulisan } from './alur-status';

export interface ItemPapanDb {
  id: string;
  judul: string;
  rubrik: string;
  status: StatusTulisan;
  tenggat: string;
  penanggung: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export async function ambilPapan(db: Db): Promise<ItemPapanDb[]> {
  const baris = await db
    .select({
      id: tulisan.id,
      judul: tulisan.judul,
      rubrik: rubrik.nama,
      status: tulisan.status,
      tenggat: tulisan.tenggat,
      penanggung: tulisan.penanggung,
    })
    .from(tulisan)
    .innerJoin(rubrik, eq(tulisan.rubrikSlug, rubrik.slug))
    .orderBy(tulisan.dibuatPada);
  return baris.map((b) => ({ ...b, status: b.status as StatusTulisan }));
}

export async function ubahStatus(
  db: Db,
  input: { id: string; ke: StatusTulisan; peran: Peran; catatan?: string },
): Promise<{ ok: true } | { ok: false; pesan: string }> {
  try {
    const [t] = await db.select({ status: tulisan.status }).from(tulisan).where(eq(tulisan.id, input.id));
    if (!t) return { ok: false, pesan: 'Tulisan tidak ditemukan.' };
    const dari = t.status as StatusTulisan;
    const hasil = pindahStatus({ dari, ke: input.ke, peran: input.peran, catatan: input.catatan });
    if (!hasil.ok) return { ok: false, pesan: hasil.alasan };
    await db.update(tulisan).set({ status: input.ke, diperbarui: new Date() }).where(eq(tulisan.id, input.id));
    await catatAudit(db, {
      peran: input.peran,
      aksi: 'ubah_status_tulisan',
      objek: 'tulisan',
      objekId: input.id,
      catatan: `${dari} -> ${input.ke}${input.catatan ? `: ${input.catatan}` : ''}`,
    });
    return { ok: true };
  } catch {
    return { ok: false, pesan: 'Status belum tersimpan. Coba lagi beberapa saat lagi.' };
  }
}

export async function ambilTulisan(db: Db, id: string): Promise<ItemPapanDb | null> {
  try {
    const [b] = await db
      .select({
        id: tulisan.id,
        judul: tulisan.judul,
        rubrik: rubrik.nama,
        status: tulisan.status,
        tenggat: tulisan.tenggat,
        penanggung: tulisan.penanggung,
      })
      .from(tulisan)
      .innerJoin(rubrik, eq(tulisan.rubrikSlug, rubrik.slug))
      .where(eq(tulisan.id, id));
    if (!b) return null;
    return { ...b, status: b.status as StatusTulisan };
  } catch {
    // ID yang bukan UUID juga jatuh ke sini, dan diperlakukan sebagai tidak ditemukan.
    return null;
  }
}

/** Isi tulisan untuk dibaca di halaman detail redaksi. */
export async function ambilIsiTulisan(db: Db, id: string): Promise<string> {
  try {
    const [b] = await db.select({ isi: tulisan.isi }).from(tulisan).where(eq(tulisan.id, id));
    return b?.isi ?? '';
  } catch {
    return '';
  }
}

/**
 * Catatan terakhir dari editor saat tulisan dikembalikan atau ditarik. Diambil dari log audit:
 * perpindahan maju tidak punya catatan, jadi hanya perpindahan terakhir yang bercatatan yang dianggap aktif.
 */
export async function ambilCatatanRevisi(db: Db, ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  try {
    const baris = await db
      .select({ objekId: logAudit.objekId, catatan: logAudit.catatan })
      .from(logAudit)
      .where(inArray(logAudit.objekId, ids))
      .orderBy(desc(logAudit.pada));
    const hasil: Record<string, string> = {};
    const sudah = new Set<string>();
    for (const b of baris as { objekId: string | null; catatan: string | null }[]) {
      if (!b.objekId || !b.catatan || !b.catatan.includes(' -> ') || sudah.has(b.objekId)) continue;
      sudah.add(b.objekId);
      const i = b.catatan.indexOf(': ');
      if (i > -1) hasil[b.objekId] = b.catatan.slice(i + 2);
    }
    return hasil;
  } catch {
    return {};
  }
}
