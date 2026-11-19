// Lima status tetap sesuai keputusan tim (ACC 18 Nov 2026): tidak boleh dilompati.
// Maju hanya satu langkah. Mundur hanya dari review_akhir, dengan catatan wajib.
// Status terjadwal dan arsip dihapus: tidak ada di keputusan tim. Tambahkan lewat keputusan baru.

import { bolehAksi, type Aksi, type Peran } from '@/lib/izin';

export const STATUS_TULISAN = ['draf', 'menunggu_desain', 'didesain', 'review_akhir', 'terbit'] as const;
export type StatusTulisan = (typeof STATUS_TULISAN)[number];

const URUTAN: Record<StatusTulisan, number> = {
  draf: 0,
  menunggu_desain: 1,
  didesain: 2,
  review_akhir: 3,
  terbit: 4,
};

export type HasilPindah = { ok: true } | { ok: false; alasan: string };

function aksiUntuk(ke: StatusTulisan): Aksi {
  switch (ke) {
    case 'menunggu_desain':
      return 'tulis_draf';
    case 'didesain':
    case 'review_akhir':
      return 'unggah_desain';
    case 'terbit':
      return 'terbitkan';
    case 'draf':
      // Draf tidak pernah tujuan maju; hanya tujuan mundur dari review (lihat cabang mundur).
      return 'tulis_draf';
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

  if (URUTAN[ke] === URUTAN[dari] + 1) {
    const aksi = aksiUntuk(ke);
    if (!bolehAksi(peran, aksi)) {
      return { ok: false, alasan: `Peranmu tidak boleh memindah tulisan ke ${ke}.` };
    }
    return { ok: true };
  }

  if (URUTAN[ke] < URUTAN[dari]) {
    if (dari !== 'review_akhir') {
      return { ok: false, alasan: 'Tulisan hanya bisa mundur dari Review akhir.' };
    }
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
