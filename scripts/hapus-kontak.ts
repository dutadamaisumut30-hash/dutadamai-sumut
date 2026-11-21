// Menghapus kontak pengirim yang sudah lewat 30 hari (ADR 005). Dijalankan harian oleh cron di VPS.
//   $env:DATABASE_URL="..."; npx tsx scripts/hapus-kontak.ts
import { buatDb } from '../src/lib/db';
import { hapusKontakKedaluwarsa } from '../src/fitur/karya/hapus-kontak';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Butuh DATABASE_URL.');
  process.exit(1);
}

hapusKontakKedaluwarsa(buatDb(url))
  .then((h) => {
    console.log(`Selesai: ${h.dihapus} kontak dihapus, ${h.dijadwalkan} dijadwalkan.`);
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error('Gagal:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
