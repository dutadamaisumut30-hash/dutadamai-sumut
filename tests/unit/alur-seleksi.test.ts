import { describe, expect, it } from 'vitest';
import { karyaBolehDikirimUlang, progresKarya } from '@/fitur/karya/alur-seleksi';

describe('alur seleksi karya', () => {
  it('antrean: langkah 1 dan 2 selesai, 3 aktif, cabang 5b belum', () => {
    const hasil = progresKarya('antrean');
    expect(hasil.find((l) => l.id === '1')?.status).toBe('selesai');
    expect(hasil.find((l) => l.id === '2')?.status).toBe('selesai');
    expect(hasil.find((l) => l.id === '3')?.status).toBe('aktif');
    expect(hasil.find((l) => l.id === '5b')?.status).toBe('cabang');
  });
  it('terbit: cabang 5a dan langkah 6 selesai', () => {
    const hasil = progresKarya('terbit');
    expect(hasil.find((l) => l.id === '5a')?.status).toBe('selesai');
    expect(hasil.find((l) => l.id === '6')?.status).toBe('selesai');
  });
  it('hanya karya yang dikembalikan boleh dikirim ulang', () => {
    expect(karyaBolehDikirimUlang('dikembalikan')).toBe(true);
    expect(karyaBolehDikirimUlang('antrean')).toBe(false);
  });
});
