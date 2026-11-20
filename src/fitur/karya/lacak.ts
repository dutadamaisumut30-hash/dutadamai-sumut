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
}

export async function ambilStatusLacak(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: PgDatabase<any, any, any>,
  kode: string,
): Promise<StatusLacak | null> {
  const [baris] = await db
    .select({ judul: karya.judul, jenis: karya.jenis, diterima: karya.dibuatPada, tahap: karya.tahap })
    .from(karya)
    .where(eq(karya.kodeLacak, kode))
    .limit(1);
  return baris ?? null;
}
