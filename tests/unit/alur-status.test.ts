import { describe, expect, it } from 'vitest';
import { pindahStatus } from '@/fitur/tulisan/alur-status';

describe('alur status tulisan', () => {
  it('maju satu langkah oleh peran yang berwenang', () => {
    expect(pindahStatus({ dari: 'draf', ke: 'menunggu_desain', peran: 'blogger' })).toEqual({ ok: true });
    expect(pindahStatus({ dari: 'menunggu_desain', ke: 'didesain', peran: 'dkv' })).toEqual({ ok: true });
  });
  it('tidak boleh melompati status', () => {
    const hasil = pindahStatus({ dari: 'draf', ke: 'terbit', peran: 'admin' });
    expect(hasil.ok).toBe(false);
  });
  it('Blogger tidak boleh menerbitkan', () => {
    const hasil = pindahStatus({ dari: 'review_akhir', ke: 'terbit', peran: 'blogger' });
    expect(hasil.ok).toBe(false);
  });
  it('mundur dari review wajib catatan dan hanya untuk Editor atau Admin', () => {
    expect(pindahStatus({ dari: 'review_akhir', ke: 'didesain', peran: 'editor' }).ok).toBe(false);
    expect(pindahStatus({ dari: 'review_akhir', ke: 'didesain', peran: 'editor', catatan: '   ' }).ok).toBe(false);
    expect(pindahStatus({ dari: 'review_akhir', ke: 'didesain', peran: 'editor', catatan: 'Kutipan belum jelas' })).toEqual({ ok: true });
    expect(pindahStatus({ dari: 'review_akhir', ke: 'draf', peran: 'dkv', catatan: 'x' }).ok).toBe(false);
  });
  it('terjadwal dan terbit hanya dari review oleh Editor', () => {
    expect(pindahStatus({ dari: 'review_akhir', ke: 'terjadwal', peran: 'editor' })).toEqual({ ok: true });
    expect(pindahStatus({ dari: 'terjadwal', ke: 'terbit', peran: 'editor' })).toEqual({ ok: true });
    expect(pindahStatus({ dari: 'terjadwal', ke: 'terbit', peran: 'blogger' }).ok).toBe(false);
  });
});
