import { describe, expect, it } from 'vitest';
import { adalahMundur, formatTanggalPendek, labelTelat } from '@/fitur/tulisan/papan';
import { pindahStatus } from '@/fitur/tulisan/alur-status';

describe('papan redaksi', () => {
  it('menghitung telat dalam hari', () => {
    expect(labelTelat('2026-11-17', '2026-11-19')).toBe('Telat 2 hari');
    expect(labelTelat('2026-11-19', '2026-11-19')).toBeNull();
    expect(labelTelat('2026-11-20', '2026-11-19')).toBeNull();
  });
  it('memformat tanggal pendek Indonesia', () => {
    expect(formatTanggalPendek('2026-11-20')).toBe('20 Nov');
    expect(formatTanggalPendek('2026-01-05')).toBe('5 Jan');
  });
  it('mengenali arah mundur', () => {
    expect(adalahMundur('review_akhir', 'didesain')).toBe(true);
    expect(adalahMundur('draf', 'menunggu_desain')).toBe(false);
  });
  it('aturan papan memakai pindahStatus yang sama dengan server', () => {
    expect(pindahStatus({ dari: 'draf', ke: 'menunggu_desain', peran: 'blogger' }).ok).toBe(true);
    expect(pindahStatus({ dari: 'draf', ke: 'didesain', peran: 'admin' }).ok).toBe(false);
    expect(pindahStatus({ dari: 'review_akhir', ke: 'didesain', peran: 'editor' }).ok).toBe(false);
    expect(pindahStatus({ dari: 'review_akhir', ke: 'didesain', peran: 'editor', catatan: 'x' }).ok).toBe(true);
  });
});
