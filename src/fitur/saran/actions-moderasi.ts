'use server';

import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';
import { gerbangAksi } from '@/lib/gerbang-aksi';
import type { HasilSaran, StatusSaran } from './alur-saran';
import { ambilSaranMasuk, gantiStatusSaran, type SaranMasukDb } from './moderasi';

const PESAN_TOLAK = 'Kotak saran hanya bisa dibaca Editor dan Admin.';

export async function muatSaranMasuk(): Promise<SaranMasukDb[]> {
  const g = await gerbangAksi('baca_kotak_saran', PESAN_TOLAK);
  if (!g.ok) throw new Error(g.alasan);
  return ambilSaranMasuk(dbTunggal(urlDbWajib()));
}

export async function gantiStatusSaranAksi(id: string, ke: StatusSaran): Promise<HasilSaran> {
  const g = await gerbangAksi('baca_kotak_saran', PESAN_TOLAK);
  if (!g.ok) return { ok: false, alasan: g.alasan };
  return gantiStatusSaran(dbTunggal(urlDbWajib()), id, ke, g.peran);
}
