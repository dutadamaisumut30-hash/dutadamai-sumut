// Data contoh kotak saran. Diganti query database setelah skema siap (tahap backend).
import type { StatusSaran } from '@/fitur/saran/alur-saran';

export interface ItemSaran {
  id: string;
  kategori: 'Saran konten' | 'Masalah teknis' | 'Ide kolaborasi';
  pesan: string;
  status: StatusSaran;
  diterima: string;
}

export const SARAN_CONTOH: ItemSaran[] = [
  { id: 's1', kategori: 'Saran konten', pesan: 'Tolong ada rubrik untuk cerita dari sekolah dasar.', status: 'baru', diterima: '18 Nov' },
  { id: 's2', kategori: 'Masalah teknis', pesan: 'Gambar di halaman berita kadang lama muncul di HP.', status: 'dibaca', diterima: '17 Nov' },
  { id: 's3', kategori: 'Ide kolaborasi', pesan: 'Kami komunitas fotografi, bisa kirim karya bersama?', status: 'ditindak', diterima: '15 Nov' },
  { id: 's4', kategori: 'Saran konten', pesan: 'Terima kasih, rubrik Tips Skill sangat membantu.', status: 'diarsip', diterima: '10 Nov' },
];
