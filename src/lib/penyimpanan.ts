import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';

export const MIME_IZIN: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'application/pdf': 'pdf',
};
export const UKURAN_MAKS = 10 * 1024 * 1024;

// Tanda awal isi berkas. Dicek supaya jenis di browser tidak dipercaya begitu saja.
const SIGNATURE: Record<string, number[]> = {
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/jpeg': [0xff, 0xd8, 0xff],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
};

export function cocokSignature(isi: Buffer, mime: string): boolean {
  const sig = SIGNATURE[mime];
  if (!sig) return false;
  return sig.every((b, i) => isi[i] === b);
}

function folderPenyimpanan(): string {
  return process.env.PENYIMPANAN_DIR ?? path.join(process.cwd(), 'penyimpanan');
}

/** Menyimpan isi berkas dengan nama acak. Mengembalikan nama berkas di folder penyimpanan. */
export async function simpanBerkas(isi: Buffer, mime: string): Promise<string> {
  const ext = MIME_IZIN[mime];
  const nama = `${randomUUID()}.${ext}`;
  await mkdir(folderPenyimpanan(), { recursive: true });
  await writeFile(path.join(folderPenyimpanan(), nama), isi);
  return nama;
}

export async function bacaBerkas(lokasi: string): Promise<Buffer> {
  if (!/^[0-9a-f-]{36}\.(png|jpg|pdf)$/.test(lokasi)) throw new Error('Lokasi berkas tidak valid.');
  return readFile(path.join(folderPenyimpanan(), lokasi));
}

/** Menghapus berkas yang sudah tersimpan. Dipakai saat penyimpanan ke database gagal. */
export async function hapusBerkas(lokasi: string): Promise<void> {
  if (!/^[0-9a-f-]{36}\.(png|jpg|pdf)$/.test(lokasi)) return;
  await unlink(path.join(folderPenyimpanan(), lokasi)).catch(() => {});
}
