'use server';

import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';
import { gerbangAksi } from '@/lib/gerbang-aksi';
import { ajukanDraf, ambilRubrikPilihan, ambilTulisanSaya, buatDraf, simpanDraf, type HasilTulis, type TulisanSaya } from './layanan';

const PESAN_TOLAK = 'Hanya Blogger, Editor, dan Admin yang boleh menulis draf.';

export async function muatTulisanSaya(): Promise<{ tulisan: TulisanSaya[]; rubrik: { slug: string; nama: string }[] }> {
  const g = await gerbangAksi('tulis_draf', PESAN_TOLAK);
  if (!g.ok) throw new Error(g.alasan);
  const db = dbTunggal(urlDbWajib());
  return { tulisan: await ambilTulisanSaya(db, g.userId), rubrik: await ambilRubrikPilihan(db) };
}

export async function buatDrafAksi(input: unknown): Promise<HasilTulis> {
  const g = await gerbangAksi('tulis_draf', PESAN_TOLAK);
  if (!g.ok) return { ok: false, pesan: g.alasan };
  return buatDraf(dbTunggal(urlDbWajib()), { userId: g.userId, nama: g.nama, peran: g.peran }, input);
}

export async function simpanDrafAksi(id: string, input: unknown): Promise<HasilTulis> {
  const g = await gerbangAksi('tulis_draf', PESAN_TOLAK);
  if (!g.ok) return { ok: false, pesan: g.alasan };
  return simpanDraf(dbTunggal(urlDbWajib()), { userId: g.userId, nama: g.nama, peran: g.peran }, id, input);
}

export async function ajukanDrafAksi(id: string): Promise<HasilTulis> {
  const g = await gerbangAksi('tulis_draf', PESAN_TOLAK);
  if (!g.ok) return { ok: false, pesan: g.alasan };
  return ajukanDraf(dbTunggal(urlDbWajib()), { userId: g.userId, nama: g.nama, peran: g.peran }, id);
}
