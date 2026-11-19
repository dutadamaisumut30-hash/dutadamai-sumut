import { describe, expect, it } from 'vitest';
import { pindahSeleksi } from '@/fitur/karya/pindah-seleksi';
import { pindahKomentar } from '@/fitur/moderasi/komentar';

describe('seleksi karya masuk', () => {
  it('alur normal: antrean, keputusan, dihubungi, terbit', () => {
    expect(pindahSeleksi({ dari: 'antrean', ke: 'keputusan', peran: 'editor' }).ok).toBe(true);
    expect(pindahSeleksi({ dari: 'keputusan', ke: 'dihubungi', peran: 'editor' }).ok).toBe(true);
    expect(pindahSeleksi({ dari: 'dihubungi', ke: 'terbit', peran: 'admin' }).ok).toBe(true);
  });
  it('tidak boleh melompati tahap', () => {
    expect(pindahSeleksi({ dari: 'antrean', ke: 'terbit', peran: 'editor' }).ok).toBe(false);
  });
  it('pengembalian wajib catatan', () => {
    expect(pindahSeleksi({ dari: 'keputusan', ke: 'dikembalikan', peran: 'editor' }).ok).toBe(false);
    expect(pindahSeleksi({ dari: 'keputusan', ke: 'dikembalikan', peran: 'editor', catatan: 'logo' }).ok).toBe(true);
  });
  it('terbit dan ditolak tidak bisa diubah, dan DKV tidak boleh menyeleksi', () => {
    expect(pindahSeleksi({ dari: 'terbit', ke: 'antrean', peran: 'admin' }).ok).toBe(false);
    expect(pindahSeleksi({ dari: 'ditolak', ke: 'antrean', peran: 'admin' }).ok).toBe(false);
    expect(pindahSeleksi({ dari: 'antrean', ke: 'keputusan', peran: 'dkv' }).ok).toBe(false);
  });
});

describe('moderasi komentar', () => {
  it('editor boleh menyetujui dan menyembunyikan, blogger tidak', () => {
    expect(pindahKomentar({ dari: 'menunggu', ke: 'tampil', peran: 'editor' }).ok).toBe(true);
    expect(pindahKomentar({ dari: 'tampil', ke: 'disembunyikan', peran: 'admin' }).ok).toBe(true);
    expect(pindahKomentar({ dari: 'menunggu', ke: 'tampil', peran: 'blogger' }).ok).toBe(false);
  });
  it('disembunyikan hanya bisa ditampilkan lagi', () => {
    expect(pindahKomentar({ dari: 'disembunyikan', ke: 'tampil', peran: 'editor' }).ok).toBe(true);
    expect(pindahKomentar({ dari: 'disembunyikan', ke: 'menunggu', peran: 'editor' }).ok).toBe(false);
  });
});
