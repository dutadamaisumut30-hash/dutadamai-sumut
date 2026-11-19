// Logika tampilan papan redaksi. Aturan perpindahan tetap di alur-status.ts.
import { STATUS_TULISAN, type StatusTulisan } from './alur-status';

export const KOLOM: Record<StatusTulisan, { nomor: number; judul: string; deskripsi: string }> = {
  draf: { nomor: 1, judul: 'Draf', deskripsi: 'Blogger menulis dan mengajukan' },
  menunggu_desain: { nomor: 2, judul: 'Menunggu desain', deskripsi: 'Sistem membuat tiket, DKV mengambil tugas' },
  didesain: { nomor: 3, judul: 'Didesain', deskripsi: 'DKV mengunggah cover dan kartu' },
  review_akhir: { nomor: 4, judul: 'Review akhir', deskripsi: 'Editor memeriksa isi, tampilan, dan pedoman' },
  terbit: { nomor: 5, judul: 'Terbit', deskripsi: 'Halaman, kartu bagikan, dan kredit tiga serangkai' },
};

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** Tanggal ISO (yyyy-mm-dd) ke "20 Nov". */
export function formatTanggalPendek(iso: string): string {
  const [, bulan, hari] = iso.split('-').map(Number);
  return `${Number(hari)} ${BULAN[bulan - 1]}`;
}

/** Jumlah hari keterlambatan, atau null kalau belum lewat tenggat. */
export function labelTelat(tenggat: string, hariIni: string): string | null {
  const selisih = Math.round(
    (Date.parse(`${hariIni}T00:00:00Z`) - Date.parse(`${tenggat}T00:00:00Z`)) / 86_400_000,
  );
  if (selisih <= 0) return null;
  return `Telat ${selisih} hari`;
}

/** Benar kalau ke adalah status yang lebih awal dari dari (mundur). */
export function adalahMundur(dari: StatusTulisan, ke: StatusTulisan): boolean {
  return STATUS_TULISAN.indexOf(ke) < STATUS_TULISAN.indexOf(dari);
}
