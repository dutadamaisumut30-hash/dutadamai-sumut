// Data contoh karya masuk. Diganti query database setelah skema siap (tahap backend).
import type { TahapKarya } from '@/fitur/karya/alur-seleksi';

export interface KaryaMasuk {
  id: string;
  judul: string;
  jenis: 'tulisan' | 'desain';
  oleh: string;
  diterima: string;
  tahap: TahapKarya;
  catatan?: string;
}

export const KARYA_MASUK_CONTOH: KaryaMasuk[] = [
  { id: 'm1', judul: 'Puisi: Sungai di kota', jenis: 'tulisan', oleh: 'Rani, SMP di Medan', diterima: '18 Nov', tahap: 'antrean' },
  { id: 'm2', judul: 'Poster: Pesan untuk teman', jenis: 'desain', oleh: '@ardhimelo', diterima: '17 Nov', tahap: 'keputusan' },
  { id: 'm3', judul: 'Cerpen: Pagi di Pajak Sore', jenis: 'tulisan', oleh: 'Nabila, SMA di Deli Serdang', diterima: '14 Nov', tahap: 'dihubungi' },
  { id: 'm4', judul: 'Poster: Dengar dulu', jenis: 'desain', oleh: '@lindung', diterima: '12 Nov', tahap: 'dikembalikan', catatan: 'Logo mitra belum sesuai pedoman.' },
  { id: 'm5', judul: 'Opini: Dari grup ke grup', jenis: 'tulisan', oleh: 'Anonim', diterima: '10 Nov', tahap: 'ditolak' },
];
