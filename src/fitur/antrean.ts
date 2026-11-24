// Penghitung antrean kerja untuk lencana di menu ruang redaksi.
import { count, eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { karya, komentar, laporan, saran, tulisan } from '@/lib/db/schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export interface Antrean {
  komentar: number;
  laporan: number;
  saran: number;
  karya: number;
  desain: number;
}

const KOSONG: Antrean = { komentar: 0, laporan: 0, saran: 0, karya: 0, desain: 0 };

async function hitung(db: Db, q: Promise<{ n: number }[]>): Promise<number> {
  try {
    return Number((await q)[0]?.n ?? 0);
  } catch {
    return 0;
  }
}

export async function hitungAntrean(db: Db): Promise<Antrean> {
  try {
    const [k, l, s, kr, d] = await Promise.all([
      hitung(db, db.select({ n: count() }).from(komentar).where(eq(komentar.status, 'menunggu'))),
      hitung(db, db.select({ n: count() }).from(laporan).where(eq(laporan.status, 'baru'))),
      hitung(db, db.select({ n: count() }).from(saran).where(eq(saran.status, 'baru'))),
      hitung(db, db.select({ n: count() }).from(karya).where(eq(karya.tahap, 'antrean'))),
      hitung(db, db.select({ n: count() }).from(tulisan).where(eq(tulisan.status, 'menunggu_desain'))),
    ]);
    return { komentar: k, laporan: l, saran: s, karya: kr, desain: d };
  } catch {
    return KOSONG;
  }
}
