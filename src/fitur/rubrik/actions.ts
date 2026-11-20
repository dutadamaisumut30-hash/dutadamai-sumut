'use server';

import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';
import { gerbangAksi } from '@/lib/gerbang-aksi';
import { ambilRubrik, ubahDeskripsiRubrik, type HasilRubrik, type RubrikDb } from './layanan';

const PESAN_TOLAK = 'Rubrik hanya bisa dikelola Editor dan Admin.';

export async function muatRubrik(): Promise<RubrikDb[]> {
  const g = await gerbangAksi('kelola_rubrik', PESAN_TOLAK);
  if (!g.ok) throw new Error(g.alasan);
  return ambilRubrik(dbTunggal(urlDbWajib()));
}

export async function simpanDeskripsiRubrik(slug: string, deskripsi: string): Promise<HasilRubrik> {
  const g = await gerbangAksi('kelola_rubrik', PESAN_TOLAK);
  if (!g.ok) return { ok: false, alasan: g.alasan };
  return ubahDeskripsiRubrik(dbTunggal(urlDbWajib()), slug, deskripsi, g.peran);
}
