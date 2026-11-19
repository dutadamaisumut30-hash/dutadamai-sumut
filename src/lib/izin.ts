// Matriks peran x aksi, sesuai rancangan (halaman 2) dan keputusan ADR 001.
// Setiap server action wajib memanggil bolehAksi() sebelum mengubah data.

export const PERAN = ['publik', 'blogger', 'dkv', 'editor', 'admin'] as const;
export type Peran = (typeof PERAN)[number];

export const AKSI = [
  'baca',
  'komentar_saran',
  'kirim_karya_formulir',
  'tulis_draf',
  'unggah_desain',
  'seleksi_karya',
  'moderasi',
  'baca_kotak_saran',
  'terbitkan',
  'ubah_status_review',
  'kelola_rubrik',
  'lihat_statistik',
  'kelola_tim',
] as const;
export type Aksi = (typeof AKSI)[number];

const SEMUA: Record<Peran, boolean> = { publik: true, blogger: true, dkv: true, editor: true, admin: true };
const HANYA_TIM_EDITOR: Record<Peran, boolean> = { publik: false, blogger: false, dkv: false, editor: true, admin: true };

const MATRIKS: Record<Aksi, Record<Peran, boolean>> = {
  baca: SEMUA,
  komentar_saran: SEMUA,
  kirim_karya_formulir: { publik: true, blogger: false, dkv: false, editor: false, admin: false },
  tulis_draf: { publik: false, blogger: true, dkv: false, editor: true, admin: true },
  unggah_desain: { publik: false, blogger: false, dkv: true, editor: true, admin: true },
  seleksi_karya: HANYA_TIM_EDITOR,
  moderasi: HANYA_TIM_EDITOR,
  // Rancangan halaman 2: "Memoderasi komentar, membaca kotak saran" hanya Editor dan Admin.
  baca_kotak_saran: HANYA_TIM_EDITOR,
  terbitkan: HANYA_TIM_EDITOR,
  ubah_status_review: HANYA_TIM_EDITOR,
  // ADR 001: rubrik dikelola Editor dan Admin. Blogger hanya memilih rubrik untuk draf sendiri (lewat tulis_draf).
  kelola_rubrik: HANYA_TIM_EDITOR,
  lihat_statistik: { publik: false, blogger: true, dkv: true, editor: true, admin: true },
  kelola_tim: { publik: false, blogger: false, dkv: false, editor: false, admin: true },
};

export function bolehAksi(peran: Peran, aksi: Aksi): boolean {
  return MATRIKS[aksi][peran];
}
