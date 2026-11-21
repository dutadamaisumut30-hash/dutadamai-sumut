'use server';

import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';
import { gerbangAksi } from '@/lib/gerbang-aksi';
import type { TahapKarya } from './alur-seleksi';
import type { HasilSeleksi } from './pindah-seleksi';
import { ambilKaryaMasuk, gantiTahapKarya, type KaryaMasukDb } from './seleksi';

const PESAN_TOLAK = 'Karya masuk hanya bisa diseleksi Editor dan Admin.';

export async function muatKaryaMasuk(): Promise<KaryaMasukDb[]> {
  const g = await gerbangAksi('seleksi_karya', PESAN_TOLAK);
  if (!g.ok) throw new Error(g.alasan);
  return ambilKaryaMasuk(dbTunggal(urlDbWajib()));
}

export async function gantiTahapKaryaAksi(id: string, ke: TahapKarya, catatan?: string): Promise<HasilSeleksi> {
  const g = await gerbangAksi('seleksi_karya', PESAN_TOLAK);
  if (!g.ok) return { ok: false, alasan: g.alasan };
  return gantiTahapKarya(dbTunggal(urlDbWajib()), id, ke, catatan, g.peran);
}
