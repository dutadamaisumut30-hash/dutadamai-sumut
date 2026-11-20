'use server';

import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';
import { gerbangAksi } from '@/lib/gerbang-aksi';
import type { AnggotaTim, HasilTim } from './tim';
import { ambilAnggota, tambahAnggota, ubahAnggota, type PatchAnggota } from './layanan';

const PESAN_TOLAK = 'Akun tim hanya bisa dikelola Admin.';

export async function muatAnggota(): Promise<AnggotaTim[]> {
  const g = await gerbangAksi('kelola_tim', PESAN_TOLAK);
  if (!g.ok) throw new Error(g.alasan);
  return ambilAnggota(dbTunggal(urlDbWajib()));
}

export async function tambahAnggotaAksi(input: { nama: string; peran: string; divisi: string }): Promise<HasilTim> {
  const g = await gerbangAksi('kelola_tim', PESAN_TOLAK);
  if (!g.ok) return { ok: false, alasan: g.alasan };
  return tambahAnggota(dbTunggal(urlDbWajib()), input, g.peran);
}

export async function ubahAnggotaAksi(id: string, patch: PatchAnggota): Promise<HasilTim> {
  const g = await gerbangAksi('kelola_tim', PESAN_TOLAK);
  if (!g.ok) return { ok: false, alasan: g.alasan };
  return ubahAnggota(dbTunggal(urlDbWajib()), id, patch, g.peran);
}
