'use server';

import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';
import { gerbangAksi } from '@/lib/gerbang-aksi';
import { ambilIp, izinkan, kunciIp } from '@/lib/batas-laju';
import { cekTurnstile } from '@/lib/turnstile';
import { ambilLaporan, layananKirimLaporan, tandaiLaporanDitangani, type HasilLaporan, type LaporanDb } from './layanan';

const PESAN_TOLAK = 'Laporan konten hanya bisa dilihat Editor dan Admin.';

export async function kirimLaporan(input: unknown, turnstile = ''): Promise<HasilLaporan> {
  const url = process.env.DATABASE_URL;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!url || !secret) return { ok: false, pesan: 'Server belum dikonfigurasi. Hubungi tim IT.' };

  const ip = await ambilIp();
  if (!izinkan(kunciIp(ip, 'kirim_laporan'), 10, 10 * 60_000)) {
    return { ok: false, pesan: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' };
  }
  return layananKirimLaporan(input, { turnstile, ip }, { db: dbTunggal(url), secretTurnstile: secret, cekTurnstile });
}

export async function muatLaporan(): Promise<LaporanDb[]> {
  const g = await gerbangAksi('moderasi', PESAN_TOLAK);
  if (!g.ok) throw new Error(g.alasan);
  return ambilLaporan(dbTunggal(urlDbWajib()));
}

export async function tandaiLaporanAksi(id: string): Promise<{ ok: true } | { ok: false; alasan: string }> {
  const g = await gerbangAksi('moderasi', PESAN_TOLAK);
  if (!g.ok) return { ok: false, alasan: g.alasan };
  return tandaiLaporanDitangani(dbTunggal(urlDbWajib()), id, g.peran);
}
