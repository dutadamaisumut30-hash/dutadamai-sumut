// Ringkasan angka untuk halaman statistik redaksi. Bukan data kunjungan (itu tugas Umami, Fase 5).
import { and, count, eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { karya, komentar, laporan, saran, tulisan } from '@/lib/db/schema';
import { STATUS_TULISAN, type StatusTulisan } from '@/fitur/tulisan/alur-status';
import { bolehAksi, type Peran } from '@/lib/izin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export interface Statistik {
  lingkup: 'semua' | 'milikku';
  tulisan: Record<StatusTulisan, number>;
  /** Hanya untuk Editor dan Admin. */
  masuk?: { komentarMenunggu: number; komentarTampil: number; laporanBaru: number; saranBaru: number; karyaAntrean: number; karyaTerbit: number };
}

export async function ambilStatistik(db: Db, pelaku: { peran: Peran; userId: string }): Promise<Statistik> {
  const semua = bolehAksi(pelaku.peran, 'ubah_status_review') || pelaku.peran === 'dkv';
  const kondisi = semua ? undefined : eq(tulisan.penulisId, pelaku.userId);
  const baris = await db.select({ status: tulisan.status, n: count() }).from(tulisan).where(kondisi).groupBy(tulisan.status);
  const peta = Object.fromEntries(STATUS_TULISAN.map((s) => [s, 0])) as Record<StatusTulisan, number>;
  for (const b of baris as { status: StatusTulisan; n: number }[]) peta[b.status] = Number(b.n);
  const hasil: Statistik = { lingkup: semua ? 'semua' : 'milikku', tulisan: peta };
  if (bolehAksi(pelaku.peran, 'ubah_status_review')) {
    const n = async (q: Promise<{ n: number }[]>) => Number((await q)[0]?.n ?? 0);
    const [km, kt, lb, sb, ka, kT] = await Promise.all([
      n(db.select({ n: count() }).from(komentar).where(eq(komentar.status, 'menunggu'))),
      n(db.select({ n: count() }).from(komentar).where(eq(komentar.status, 'tampil'))),
      n(db.select({ n: count() }).from(laporan).where(eq(laporan.status, 'baru'))),
      n(db.select({ n: count() }).from(saran).where(eq(saran.status, 'baru'))),
      n(db.select({ n: count() }).from(karya).where(eq(karya.tahap, 'antrean'))),
      n(db.select({ n: count() }).from(karya).where(and(eq(karya.tahap, 'terbit')))),
    ]);
    hasil.masuk = { komentarMenunggu: km, komentarTampil: kt, laporanBaru: lb, saranBaru: sb, karyaAntrean: ka, karyaTerbit: kT };
  }
  return hasil;
}
