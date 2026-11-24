// Membersihkan file yatim di folder penyimpanan (file yang tidak lagi dirujuk tabel berkas).
// Default: hanya melaporkan. Tambahkan --hapus untuk benar-benar menghapus.
// Pemakaian (PowerShell): npx tsx --env-file=.env scripts/bersihkan-penyimpanan.ts [--hapus]
import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { buatDb } from '../src/lib/db';
import * as schema from '../src/lib/db/schema';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL belum diatur.');
  process.exit(1);
}
async function main() {
  const hapus = process.argv.includes('--hapus');
  const folder = process.env.PENYIMPANAN_DIR || path.join(process.cwd(), 'penyimpanan');

  const db = buatDb(url);
  const dipakai = new Set((await db.select({ lokasi: schema.berkas.lokasi }).from(schema.berkas)).map((b: { lokasi: string }) => b.lokasi));
  const semua = await readdir(folder).catch(() => [] as string[]);
  let yatim = 0;
  let byte = 0;
  for (const nama of semua) {
    if (!/^[0-9a-f-]{36}\.(png|jpg|pdf)$/.test(nama) || dipakai.has(nama)) continue;
    const info = await stat(path.join(folder, nama));
    yatim += 1;
    byte += info.size;
    if (hapus) await unlink(path.join(folder, nama));
    console.log(`${hapus ? 'dihapus' : 'yatim'}: ${nama}`);
  }
  console.log(`${semua.length} file, ${dipakai.size} dipakai, ${yatim} yatim (${(byte / 1024).toFixed(0)} KB). ${hapus ? 'Sudah dihapus.' : 'Jalankan lagi dengan --hapus untuk menghapus.'}`);
}

main().then(() => process.exit(0)).catch((e: unknown) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
