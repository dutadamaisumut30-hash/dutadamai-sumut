import { desc, eq, inArray } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { berkas, karya } from '@/lib/db/schema';
import { catatAudit } from '@/lib/audit';
import type { Peran } from '@/lib/izin';
import type { TahapKarya } from './alur-seleksi';
import { pindahSeleksi, type HasilSeleksi } from './pindah-seleksi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export interface KaryaMasukDb {
  id: string;
  judul: string;
  jenis: 'tulisan' | 'desain';
  oleh: string;
  diterima: string;
  tahap: TahapKarya;
  catatan?: string;
  berkas: { id: string; namaAsli: string }[];
}

function tanggalPendek(d: Date): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).format(d);
}

/** Semua karya masuk, terbaru dulu. Data kontak pengirim tidak diambil. */
export async function ambilKaryaMasuk(db: Db): Promise<KaryaMasukDb[]> {
  const baris = await db
    .select({ id: karya.id, judul: karya.judul, jenis: karya.jenis, oleh: karya.oleh, tahap: karya.tahap, catatan: karya.catatan, dibuatPada: karya.dibuatPada })
    .from(karya)
    .orderBy(desc(karya.dibuatPada));
  if (baris.length === 0) return [];

  const ids = baris.map((b: any) => b.id);
  const files = await db
    .select({ id: berkas.id, karyaId: berkas.karyaId, namaAsli: berkas.namaAsli })
    .from(berkas)
    .where(inArray(berkas.karyaId, ids));

  return baris.map((b: any) => ({
    id: b.id,
    judul: b.judul,
    jenis: b.jenis,
    oleh: b.oleh,
    diterima: tanggalPendek(b.dibuatPada),
    tahap: b.tahap,
    catatan: b.catatan ?? undefined,
    berkas: files.filter((f: any) => f.karyaId === b.id).map((f: any) => ({ id: f.id, namaAsli: f.namaAsli })),
  }));
}

/** Memindahkan tahap karya. Aturan perpindahan ada di pindahSeleksi. */
export async function gantiTahapKarya(
  db: Db,
  id: string,
  ke: TahapKarya,
  catatan: string | undefined,
  peran: Peran,
): Promise<HasilSeleksi> {
  try {
    const [k] = await db.select({ tahap: karya.tahap }).from(karya).where(eq(karya.id, id));
    if (!k) return { ok: false, alasan: 'Karya tidak ditemukan.' };
    const cek = pindahSeleksi({ dari: k.tahap, ke, peran, catatan });
    if (!cek.ok) return cek;

    await db
      .update(karya)
      .set({ tahap: ke, ...(ke === 'dikembalikan' ? { catatan: catatan!.trim() } : {}) })
      .where(eq(karya.id, id));
    await catatAudit(db, {
      peran,
      aksi: 'ubah_tahap_karya',
      objek: 'karya',
      objekId: id,
      catatan: `${k.tahap} -> ${ke}`,
    });
    return { ok: true };
  } catch {
    return { ok: false, alasan: 'Perubahan belum tersimpan. Coba lagi.' };
  }
}
