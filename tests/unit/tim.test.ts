import { describe, expect, it } from 'vitest';
import { DIVISI_AWAL, hitungTampil, kelompokkanPublik, TIM_CONTOH, validasiAnggota } from '@/fitur/tim/tim';

describe('akun tim', () => {
  it('halaman publik hanya menampilkan anggota yang tampil, sesuai urutan divisi', () => {
    const data = [
      { id: 'a', nama: 'A', peran: 'x', divisi: 'IT', tampil: true },
      { id: 'b', nama: 'B', peran: 'x', divisi: 'Blogger', tampil: false },
      { id: 'c', nama: 'C', peran: 'x', divisi: 'Blogger', tampil: true },
    ];
    const k = kelompokkanPublik(data, DIVISI_AWAL);
    expect(k.map((g) => g.divisi)).toEqual(['Blogger', 'IT']);
    expect(k[0].anggota.map((a) => a.nama)).toEqual(['C']);
  });
  it('menghitung anggota tampil', () => {
    expect(hitungTampil(TIM_CONTOH)).toBe(TIM_CONTOH.length);
  });
  it('validasi tambah anggota', () => {
    expect(validasiAnggota({ nama: ' ', peran: 'x', divisi: 'IT' }).ok).toBe(false);
    expect(validasiAnggota({ nama: 'A', peran: '', divisi: 'IT' }).ok).toBe(false);
    expect(validasiAnggota({ nama: 'A', peran: 'x', divisi: '' }).ok).toBe(false);
    expect(validasiAnggota({ nama: 'A', peran: 'x', divisi: 'IT' }).ok).toBe(true);
  });
});
