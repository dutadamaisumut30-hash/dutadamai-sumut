import { describe, expect, it } from 'vitest';
import { bolehAksi } from '@/lib/izin';

describe('matriks izin (rancangan halaman 2)', () => {
  it('publik boleh kirim karya lewat formulir, peran lain tidak', () => {
    expect(bolehAksi('publik', 'kirim_karya_formulir')).toBe(true);
    expect(bolehAksi('blogger', 'kirim_karya_formulir')).toBe(false);
  });
  it('Blogger boleh menulis draf tapi tidak mengunggah desain', () => {
    expect(bolehAksi('blogger', 'tulis_draf')).toBe(true);
    expect(bolehAksi('blogger', 'unggah_desain')).toBe(false);
  });
  it('DKV boleh mengunggah desain, tidak menerbitkan', () => {
    expect(bolehAksi('dkv', 'unggah_desain')).toBe(true);
    expect(bolehAksi('dkv', 'terbitkan')).toBe(false);
  });
  it('Editor menerbitkan dan memoderasi, Admin mengelola tim', () => {
    expect(bolehAksi('editor', 'terbitkan')).toBe(true);
    expect(bolehAksi('editor', 'moderasi')).toBe(true);
    expect(bolehAksi('editor', 'kelola_tim')).toBe(false);
    expect(bolehAksi('admin', 'kelola_tim')).toBe(true);
  });
  it('kotak saran hanya dibaca Editor dan Admin (rancangan halaman 2)', () => {
    expect(bolehAksi('blogger', 'baca_kotak_saran')).toBe(false);
    expect(bolehAksi('dkv', 'baca_kotak_saran')).toBe(false);
    expect(bolehAksi('editor', 'baca_kotak_saran')).toBe(true);
    expect(bolehAksi('admin', 'baca_kotak_saran')).toBe(true);
  });
  it('rubrik hanya dikelola Editor dan Admin (ADR 001)', () => {
    expect(bolehAksi('blogger', 'kelola_rubrik')).toBe(false);
    expect(bolehAksi('editor', 'kelola_rubrik')).toBe(true);
  });
});
