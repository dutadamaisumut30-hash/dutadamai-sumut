// Lima status rancangan (draf -> menunggu_desain -> didesain -> review_akhir -> terbit).
// Status terjadwal dan arsip menutup celah jadwal terbit dan pengarsipan (dokumen teknis).
// Aturan: maju hanya satu langkah, kecuali dari review_akhir ke terjadwal/terbit.
// Mundur hanya dari review_akhir ke draf/menunggu_desain/didesain, dengan catatan wajib.

import { bolehAksi, type Aksi, type Peran } from '@/lib/izin';

export const STATUS_TULISAN = [
  'draf',
  'menunggu_desain',
  'didesain',
  'review_akhir',
  'terjadwal',
  'terbit',
  'arsip',
] as const;
export type StatusTulisan = (typeof STATUS_TULISAN)[number];

const MAJU: Record<StatusTulisan, StatusTulisan[]> = {
  draf: ['menunggu_desain'],
  menunggu_desain: ['didesain'],
  didesain: ['review_akhir'],
  review_akhir: ['terjadwal', 'terbit'],
  terjadwal: ['terbit'],
  terbit: ['arsip'],
  arsip: [],
};

const MUNDUR_DARI_REVIEW: StatusTulisan[] = ['draf', 'menunggu_desain', 'didesain'];

export type HasilPindah = { ok: true } | { ok: false; alasan: string };

function aksiUntuk(ke: StatusTulisan): Aksi {
  switch (ke) {
    case 'menunggu_desain':
      return 'tulis_draf';
    case 'didesain':
    case 'review_akhir':
      return 'unggah_desain';
    case 'terjadwal':
    case 'terbit':
    case 'arsip':
      return 'terbitkan';
    default:
      return 'terbitkan';
  }
}

export function pindahStatus(input: {
  dari: StatusTulisan;
  ke: StatusTulisan;
  peran: Peran;
  catatan?: string;
}): HasilPindah {
  const { dari, ke, peran, catatan } = input;

  if (dari === ke) return { ok: false, alasan: 'Tulisan sudah berstatus itu.' };

  if (MAJU[dari].includes(ke)) {
    const aksi = aksiUntuk(ke);
    if (!bolehAksi(peran, aksi)) {
      return { ok: false, alasan: `Peranmu tidak boleh memindah tulisan ke ${ke}.` };
    }
    return { ok: true };
  }

  if (dari === 'review_akhir' && MUNDUR_DARI_REVIEW.includes(ke)) {
    if (!bolehAksi(peran, 'ubah_status_review')) {
      return { ok: false, alasan: 'Hanya Editor dan Admin yang boleh mengembalikan tulisan dari review.' };
    }
    if (!catatan || catatan.trim().length === 0) {
      return { ok: false, alasan: 'Catatan wajib diisi saat mengembalikan tulisan.' };
    }
    return { ok: true };
  }

  return { ok: false, alasan: 'Status tidak boleh dilompati.' };
}
