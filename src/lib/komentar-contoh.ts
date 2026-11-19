// Data contoh komentar dan laporan. Diganti query database setelah skema siap (tahap backend).
import type { StatusKomentar } from '@/fitur/moderasi/komentar';

export interface KomentarContoh {
  id: string;
  tulisan: string;
  isi: string;
  oleh: string;
  status: StatusKomentar;
  laporan: number;
}

export const KOMENTAR_CONTOH: KomentarContoh[] = [
  { id: 'k1', tulisan: 'Pasar pagi yang jadi titik temu tiga suku', isi: 'Setuju, tulisan ini bikin saya mikir ulang.', oleh: 'Sandi', status: 'menunggu', laporan: 0 },
  { id: 'k2', tulisan: 'Pasar pagi yang jadi titik temu tiga suku', isi: 'Ini hoaks!! Jangan percaya.', oleh: 'anonim123', status: 'menunggu', laporan: 2 },
  { id: 'k3', tulisan: 'Toleransi itu kerja harian', isi: 'Makasih ceritanya, saya dari Binjai.', oleh: 'Mega', status: 'tampil', laporan: 0 },
  { id: 'k4', tulisan: 'Cek fakta dalam 5 langkah', isi: 'Tulisannya ngawur semua.', oleh: 'akun-baru', status: 'disembunyikan', laporan: 3 },
];
