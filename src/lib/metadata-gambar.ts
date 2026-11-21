// Menghapus metadata dari JPEG dan PNG (EXIF, XMP, IPTC, komentar, dan teks), termasuk lokasi GPS.
// Mengembalikan null jika struktur berkas tidak bisa dibaca, supaya berkas seperti itu ditolak.

const PNG_BUANG = new Set(['tEXt', 'zTXt', 'iTXt', 'eXIf']);

function jpegBersih(isi: Buffer): Buffer | null {
  if (isi.length < 4 || isi[0] !== 0xff || isi[1] !== 0xd8) return null;
  const out: Buffer[] = [isi.subarray(0, 2)];
  let i = 2;
  while (i + 2 <= isi.length) {
    if (isi[i] !== 0xff) return null;
    const penanda = isi[i + 1];
    if (penanda === 0xda) {
      // SOS: sisanya adalah data gambar.
      out.push(isi.subarray(i));
      return Buffer.concat(out);
    }
    if (penanda === 0xd9) {
      out.push(isi.subarray(i, i + 2));
      return Buffer.concat(out);
    }
    if (penanda === 0x01 || (penanda >= 0xd0 && penanda <= 0xd7)) {
      out.push(isi.subarray(i, i + 2));
      i += 2;
      continue;
    }
    if (i + 4 > isi.length) return null;
    const panjang = isi.readUInt16BE(i + 2);
    const akhir = i + 2 + panjang;
    if (panjang < 2 || akhir > isi.length) return null;
    // APP1 (EXIF/XMP), APP13 (IPTC), dan COM (komentar) dibuang.
    const buang = penanda === 0xe1 || penanda === 0xed || penanda === 0xfe;
    if (!buang) out.push(isi.subarray(i, akhir));
    i = akhir;
  }
  return null;
}

function pngBersih(isi: Buffer): Buffer | null {
  if (isi.length < 8 || isi.readUInt32BE(0) !== 0x89504e47) return null;
  const out: Buffer[] = [isi.subarray(0, 8)];
  let i = 8;
  while (i + 12 <= isi.length) {
    const panjang = isi.readUInt32BE(i);
    const tipe = isi.toString('ascii', i + 4, i + 8);
    const akhir = i + 12 + panjang;
    if (akhir > isi.length) return null;
    if (!PNG_BUANG.has(tipe)) out.push(isi.subarray(i, akhir));
    i = akhir;
    if (tipe === 'IEND') return Buffer.concat(out);
  }
  return null;
}

export function hapusMetadataGambar(isi: Buffer, mime: string): Buffer | null {
  if (mime === 'image/jpeg') return jpegBersih(isi);
  if (mime === 'image/png') return pngBersih(isi);
  return null;
}
