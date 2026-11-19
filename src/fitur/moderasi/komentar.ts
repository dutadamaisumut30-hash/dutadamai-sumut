// Moderasi komentar. Hanya Editor dan Admin (izin moderasi). ADR 007: dua editor moderator.
import { bolehAksi, type Peran } from '@/lib/izin';

export const STATUS_KOMENTAR = ['menunggu', 'tampil', 'disembunyikan'] as const;
export type StatusKomentar = (typeof STATUS_KOMENTAR)[number];

const BOLEH_KE: Record<StatusKomentar, readonly StatusKomentar[]> = {
  menunggu: ['tampil', 'disembunyikan'],
  tampil: ['disembunyikan'],
  disembunyikan: ['tampil'],
};

export type HasilKomentar = { ok: true } | { ok: false; alasan: string };

export function pindahKomentar(input: { dari: StatusKomentar; ke: StatusKomentar; peran: Peran }): HasilKomentar {
  if (!bolehAksi(input.peran, 'moderasi')) {
    return { ok: false, alasan: 'Hanya Editor dan Admin yang boleh memoderasi komentar.' };
  }
  if (!BOLEH_KE[input.dari].includes(input.ke)) {
    return { ok: false, alasan: 'Perpindahan status komentar ini tidak diizinkan.' };
  }
  return { ok: true };
}
