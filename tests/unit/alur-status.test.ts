import { describe, expect, it } from 'vitest';
import { pindahStatus } from '@/fitur/tulisan/alur-status';

describe('alur status tulisan (lima status tetap)', () => {
  it('maju satu langkah oleh peran yang berwenang', () => {
    expect(pindahStatus({ dari: 'draf', ke: 'menunggu_desain', peran: 'blogger' })).toEqual({ ok: true });
    expect(pindahStatus({ dari: 'menunggu_desain', ke: 'didesain', peran: 'dkv' })).toEqual({ ok: true });
  });
  it('tidak boleh melompati status', () => {
    expect(pindahStatus({ dari: 'draf', ke: 'terbit', peran: 'admin' }).ok).toBe(false);
    expect(pindahStatus({ dari: 'draf', ke: 'didesain', peran: 'admin' }).ok).toBe(false);
  });
  it('Blogger tidak boleh menerbitkan', () => {
    expect(pindahStatus({ dari: 'review_akhir', ke: 'terbit', peran: 'blogger' }).ok).toBe(false);
  });
  it('Editor menerbitkan langsung dari review akhir', () => {
    expect(pindahStatus({ dari: 'review_akhir', ke: 'terbit', peran: 'editor' })).toEqual({ ok: true });
  });
  it('mundur wajib catatan dan hanya untuk Editor atau Admin', () => {
    expect(pindahStatus({ dari: 'review_akhir', ke: 'didesain', peran: 'editor' }).ok).toBe(false);
    expect(pindahStatus({ dari: 'review_akhir', ke: 'didesain', peran: 'editor', catatan: '   ' }).ok).toBe(false);
    expect(pindahStatus({ dari: 'review_akhir', ke: 'didesain', peran: 'editor', catatan: 'Kutipan belum jelas' })).toEqual({ ok: true });
    expect(pindahStatus({ dari: 'review_akhir', ke: 'draf', peran: 'dkv', catatan: 'x' }).ok).toBe(false);
    expect(pindahStatus({ dari: 'didesain', ke: 'menunggu_desain', peran: 'blogger', catatan: 'x' }).ok).toBe(false);
  });
  it('mundur boleh dari status mana pun, termasuk tarik dari terbit, ke status yang lebih awal', () => {
    expect(pindahStatus({ dari: 'menunggu_desain', ke: 'draf', peran: 'editor', catatan: 'Perlu ditulis ulang' })).toEqual({ ok: true });
    expect(pindahStatus({ dari: 'didesain', ke: 'draf', peran: 'admin', catatan: 'x' })).toEqual({ ok: true });
    expect(pindahStatus({ dari: 'terbit', ke: 'review_akhir', peran: 'admin', catatan: 'Koreksi data' })).toEqual({ ok: true });
    expect(pindahStatus({ dari: 'terbit', ke: 'draf', peran: 'editor', catatan: 'Ditarik sementara' })).toEqual({ ok: true });
    expect(pindahStatus({ dari: 'terbit', ke: 'draf', peran: 'editor' }).ok).toBe(false);
  });
  it('status terjadwal dan arsip tidak ada (tidak diputuskan tim)', () => {
    expect(pindahStatus({ dari: 'review_akhir', ke: 'terjadwal' as never, peran: 'editor' }).ok).toBe(false);
    expect(pindahStatus({ dari: 'terbit', ke: 'arsip' as never, peran: 'editor' }).ok).toBe(false);
  });
});
