// Status kotak saran. Hanya Editor dan Admin yang boleh membaca dan memindahkan saran.
import { bolehAksi, type Peran } from '@/lib/izin';

export const STATUS_SARAN = ['baru', 'dibaca', 'ditindak', 'diarsip'] as const;
export type StatusSaran = (typeof STATUS_SARAN)[number];

const BOLEH_KE: Record<StatusSaran, readonly StatusSaran[]> = {
  baru: ['dibaca', 'diarsip'],
  dibaca: ['ditindak', 'diarsip'],
  ditindak: ['diarsip'],
  diarsip: [],
};

export type HasilSaran = { ok: true } | { ok: false; alasan: string };

export function pindahSaran(input: { dari: StatusSaran; ke: StatusSaran; peran: Peran }): HasilSaran {
  const { dari, ke, peran } = input;
  if (!bolehAksi(peran, 'baca_kotak_saran')) {
    return { ok: false, alasan: 'Hanya Editor dan Admin yang boleh membaca kotak saran.' };
  }
  if (dari === ke) return { ok: false, alasan: 'Saran sudah berstatus itu.' };
  if (!BOLEH_KE[dari].includes(ke)) {
    return { ok: false, alasan: 'Perpindahan status saran ini tidak diizinkan.' };
  }
  return { ok: true };
}
