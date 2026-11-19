// Perpindahan tahap karya masuk. Hanya Editor dan Admin (izin seleksi_karya).
// Pengembalian dengan catatan wajib (alur 5b). Terbit dan ditolak tidak bisa diubah lagi.
import { bolehAksi, type Peran } from '@/lib/izin';
import type { TahapKarya } from './alur-seleksi';

const BOLEH_KE: Record<TahapKarya, readonly TahapKarya[]> = {
  formulir: ['antrean'],
  antrean: ['keputusan'],
  keputusan: ['dihubungi', 'dikembalikan', 'ditolak'],
  dihubungi: ['terbit'],
  dikembalikan: ['antrean'],
  terbit: [],
  ditolak: [],
};

export type HasilSeleksi = { ok: true } | { ok: false; alasan: string };

export function pindahSeleksi(input: { dari: TahapKarya; ke: TahapKarya; peran: Peran; catatan?: string }): HasilSeleksi {
  const { dari, ke, peran, catatan } = input;
  if (!bolehAksi(peran, 'seleksi_karya')) {
    return { ok: false, alasan: 'Hanya Editor dan Admin yang boleh menyeleksi karya.' };
  }
  if (!BOLEH_KE[dari].includes(ke)) {
    return { ok: false, alasan: 'Perpindahan tahap ini tidak diizinkan.' };
  }
  if (ke === 'dikembalikan' && !catatan?.trim()) {
    return { ok: false, alasan: 'Catatan wajib diisi saat mengembalikan karya.' };
  }
  return { ok: true };
}
