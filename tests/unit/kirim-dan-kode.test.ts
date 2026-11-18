import { describe, expect, it } from 'vitest';
import { skemaKirimKarya } from '@/fitur/karya/kirim';
import { buatKodeLacak, kodeLacakValid } from '@/lib/kode-lacak';
import { sudahWaktunya, tanggalHapusKontak } from '@/fitur/karya/kontak-retensi';

const dasar = {
  jenis: 'tulisan' as const,
  judul: 'Judul',
  isi: 'Isi tulisan',
  namaPanggung: 'anakmedan',
  kontak: '0812345678',
  buatanSendiri: true as const,
};

describe('validasi Kirim Karya', () => {
  it('menerima data lengkap', () => {
    expect(skemaKirimKarya.safeParse(dasar).success).toBe(true);
  });
  it('menolak tanpa centang buatan sendiri', () => {
    expect(skemaKirimKarya.safeParse({ ...dasar, buatanSendiri: false }).success).toBe(false);
  });
  it('menolak tulisan tanpa isi', () => {
    expect(skemaKirimKarya.safeParse({ ...dasar, isi: '   ' }).success).toBe(false);
  });
});

describe('kode lacak', () => {
  it('buatan selalu lolos validasi dan tidak memakai I, L, O, 0, 1', () => {
    for (let i = 0; i < 50; i++) {
      const kode = buatKodeLacak();
      expect(kodeLacakValid(kode)).toBe(true);
      expect(kode).not.toMatch(/[ILO01]/);
    }
  });
  it('menolak format salah', () => {
    expect(kodeLacakValid('ABCD1234')).toBe(false);
  });
});

describe('retensi kontak 30 hari (ADR 005)', () => {
  it('tanggal hapus jatuh 30 hari setelah keputusan final', () => {
    const final = new Date('2026-11-01T00:00:00Z');
    const hapus = tanggalHapusKontak(final);
    expect(hapus.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(sudahWaktunya(hapus, new Date('2026-11-30T23:59:59Z'))).toBe(false);
    expect(sudahWaktunya(hapus, new Date('2026-12-01T00:00:00Z'))).toBe(true);
  });
});
