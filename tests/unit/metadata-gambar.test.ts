import { describe, expect, it } from 'vitest';
import { hapusMetadataGambar } from '@/lib/metadata-gambar';

function chunk(tipe: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  return Buffer.concat([len, Buffer.from(tipe, 'ascii'), data, Buffer.alloc(4)]);
}

describe('hapus metadata gambar', () => {
  it('PNG: chunk teks dan EXIF dibuang, chunk gambar tetap ada', () => {
    const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const ihdr = chunk('IHDR', Buffer.alloc(13));
    const teks = chunk('tEXt', Buffer.from('GPS\0-3.59,98.67'));
    const exif = chunk('eXIf', Buffer.from('lokasi-rahasia'));
    const iend = chunk('IEND', Buffer.alloc(0));
    const hasil = hapusMetadataGambar(Buffer.concat([sig, ihdr, teks, exif, iend]), 'image/png');
    expect(hasil).not.toBeNull();
    const teksHasil = hasil!.toString('latin1');
    expect(teksHasil).not.toContain('GPS');
    expect(teksHasil).not.toContain('lokasi-rahasia');
    expect(teksHasil).toContain('IHDR');
    expect(teksHasil).toContain('IEND');
  });

  it('JPEG: segmen EXIF dibuang, data gambar tetap ada', () => {
    const exif = Buffer.concat([Buffer.from([0xff, 0xe1, 0x00, 0x0b]), Buffer.from('Exif\0\0GPS', 'latin1')]);
    const sos = Buffer.from([0xff, 0xda, 0x00, 0x02, 0x01, 0x02, 0x03]);
    const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8]), exif, sos, Buffer.from([0xff, 0xd9])]);
    const hasil = hapusMetadataGambar(jpeg, 'image/jpeg');
    expect(hasil).not.toBeNull();
    expect(hasil!.toString('latin1')).not.toContain('Exif');
    expect(hasil![0]).toBe(0xff);
    expect(hasil![1]).toBe(0xd8);
    expect(hasil!.includes(Buffer.from([0x01, 0x02, 0x03]))).toBe(true);
  });

  it('menolak berkas yang strukturnya rusak', () => {
    expect(hapusMetadataGambar(Buffer.from([0xff, 0xd8, 0x00, 0x00]), 'image/jpeg')).toBeNull();
    expect(hapusMetadataGambar(Buffer.from('bukan png'), 'image/png')).toBeNull();
  });
});
