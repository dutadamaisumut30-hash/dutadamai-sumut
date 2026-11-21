import { cocokSignature, MIME_IZIN, UKURAN_MAKS } from '@/lib/penyimpanan';

/** Mengembalikan pesan kesalahan, atau null jika berkas lolos pemeriksaan jenis, ukuran, dan isi. */
export function validasiBerkas(input: {
  mime: string;
  isi: Buffer;
  mimeIzin?: readonly string[];
  batasByte?: number;
}): string | null {
  const izin = input.mimeIzin ?? Object.keys(MIME_IZIN);
  if (!izin.includes(input.mime)) return 'Jenis berkas tidak diizinkan.';
  if (input.isi.length === 0) return 'Berkas kosong.';
  if (input.isi.length > (input.batasByte ?? UKURAN_MAKS)) return 'Ukuran berkas terlalu besar.';
  if (!cocokSignature(input.isi, input.mime)) return 'Isi berkas tidak sesuai jenisnya.';
  return null;
}
