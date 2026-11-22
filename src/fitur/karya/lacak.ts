// Pembacaan status karya dari database untuk halaman lacak. Tidak pernah mengembalikan kontak.
import { eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { karya } from '@/lib/db/schema';
import type { TahapKarya } from './alur-seleksi';

export interface StatusLacak {
  judul: string;
  jenis: 'tulisan' | 'desain';
  diterima: Date;
  tahap: TahapKarya;
  /** Catatan redaksi untuk pengirim. Hanya terisi saat karya dikembalikan. */
  catatan?: string;
}

export async function ambilStatusLacak(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: PgDatabase<any, any, any>,
  kode: string,
): Promise<StatusLacak | null> {
  const [baris] = await db
    .select({ judul: karya.judul, jenis: karya.jenis, diterima: karya.dibuatPada, tahap: karya.tahap, catatan: karya.catatan })
    .from(karya)
    .where(eq(karya.kodeLacak, kode))
    .limit(1);
  if (!baris) return null;
  const { catatan, ...dasar } = baris;
  // Catatan hanya relevan untuk pengirim saat karyanya dikembalikan.
  return dasar.tahap === 'dikembalikan' && catatan ? { ...dasar, catatan } : dasar;
}
