// Data contoh papan redaksi. Diganti query database setelah skema siap (tahap backend).
import type { StatusTulisan } from '@/fitur/tulisan/alur-status';
import type { NamaRubrik } from './data-contoh';

export interface ItemPapan {
  id: string;
  judul: string;
  rubrik: NamaRubrik;
  status: StatusTulisan;
  /** Tenggat dalam format yyyy-mm-dd. */
  tenggat: string;
  /** Inisial anggota yang mengerjakan. */
  penanggung: string[];
}

export const ITEM_PAPAN_CONTOH: ItemPapan[] = [
  { id: 'a', judul: 'Toleransi itu kerja harian, bukan tema lomba', rubrik: 'Opini Pelajar', status: 'draf', tenggat: '2026-11-20', penanggung: ['YS'] },
  { id: 'b', judul: 'Bikin podcast pakai HP', rubrik: 'Tips Skill', status: 'draf', tenggat: '2026-11-22', penanggung: ['NA'] },
  { id: 'c', judul: 'Pasar pagi yang jadi titik temu tiga suku', rubrik: 'Cerita Sumut', status: 'menunggu_desain', tenggat: '2026-11-17', penanggung: ['NA'] },
  { id: 'd', judul: 'Dari ruang kelas ke panggung', rubrik: 'Profil Duta', status: 'menunggu_desain', tenggat: '2026-11-18', penanggung: ['PL'] },
  { id: 'e', judul: 'Begini cara satu tulisan sampai ke berandamu', rubrik: 'Di Balik Layar', status: 'didesain', tenggat: '2026-11-24', penanggung: ['YS', 'RK'] },
  { id: 'f', judul: 'Cek fakta dalam 5 langkah', rubrik: 'Tips Skill', status: 'review_akhir', tenggat: '2026-11-25', penanggung: ['NA', 'SM'] },
  { id: 'g', judul: 'Satu kampung, tiga rumah ibadah', rubrik: 'Cerita Sumut', status: 'terbit', tenggat: '2026-11-12', penanggung: ['NA', 'RK'] },
];
