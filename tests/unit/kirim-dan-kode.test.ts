import { describe, expect, it } from 'vitest';
import { skemaKirimKarya, BATAS_BERKAS_BYTE } from '@/fitur/karya/kirim';
import { buatKodeLacak, kodeLacakValid } from '@/lib/kode-lacak';
import { sudahWaktunya, tanggalHapusKontak, tanggalHapusKontakRevisi } from '@/fitur/karya/kontak-retensi';

const dasar = {
  jenis: 'tulisan' as const,
  judul: 'Judul',
  isi: 'Isi tulisan',
  namaPanggung: 'anakmedan',
  kontak: '0812345678',
  buatanSendiri: true as const,
};
const desainDasar = {
  ...dasar,
  jenis: 'desain' as const,
  isi: '',
};

describe('validasi Kirim Karya', () => {
  it('menerima tulisan lengkap', () => {
    expect(skemaKirimKarya.safeParse(dasar).success).toBe(true);
  });
  it('menolak tanpa centang buatan sendiri', () => {
    expect(skemaKirimKarya.safeParse({ ...dasar, buatanSendiri: false }).success).toBe(false);
  });
  it('menolak tulisan tanpa isi', () => {
    expect(skemaKirimKarya.safeParse({ ...dasar, isi: '   ' }).success).toBe(false);
  });
  it('menolak desain tanpa berkas (celah: server dulu menerima)', () => {
    expect(skemaKirimKarya.safeParse(desainDasar).success).toBe(false);
  });
  it('menerima desain PNG di bawah 5 MB', () => {
    const berkas = { nama: 'poster.png', tipe: 'image/png', ukuranByte: 1024 * 1024 };
    expect(skemaKirimKarya.safeParse({ ...desainDasar, berkas }).success).toBe(true);
  });
  it('menolak berkas di atas 5 MB di server, bukan hanya di browser', () => {
    const berkas = { nama: 'besar.jpg', tipe: 'image/jpeg', ukuranByte: BATAS_BERKAS_BYTE + 1 };
    expect(skemaKirimKarya.safeParse({ ...desainDasar, berkas }).success).toBe(false);
  });
  it('menolak berkas selain JPG dan PNG', () => {
    const berkas = { nama: 'x.gif', tipe: 'image/gif', ukuranByte: 1000 };
    expect(skemaKirimKarya.safeParse({ ...desainDasar, berkas }).success).toBe(false);
  });
  it('peserta di bawah 18 tahun wajib disetujui orang tua', () => {
    expect(skemaKirimKarya.safeParse({ ...dasar, dibawahUmur18: true, orangTuaTahu: false }).success).toBe(false);
    expect(skemaKirimKarya.safeParse({ ...dasar, dibawahUmur18: true, orangTuaTahu: true }).success).toBe(true);
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

describe('retensi kontak (ADR 005)', () => {
  it('terbit atau ditolak: hapus 30 hari setelah keputusan final', () => {
    const final = new Date('2026-11-01T00:00:00Z');
    const hapus = tanggalHapusKontak(final);
    expect(hapus.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(sudahWaktunya(hapus, new Date('2026-11-30T23:59:59Z'))).toBe(false);
    expect(sudahWaktunya(hapus, new Date('2026-12-01T00:00:00Z'))).toBe(true);
  });
  it('perlu revisi: 30 hari tanpa respons, kecuali karya ditutup lebih dulu', () => {
    const respons = new Date('2026-11-01T00:00:00Z');
    expect(tanggalHapusKontakRevisi({ terakhirRespons: respons }).toISOString()).toBe('2026-12-01T00:00:00.000Z');
    const tutup = new Date('2026-11-10T00:00:00Z');
    expect(tanggalHapusKontakRevisi({ terakhirRespons: respons, ditutupPada: tutup }).toISOString()).toBe(
      '2026-11-10T00:00:00.000Z',
    );
  });
});
