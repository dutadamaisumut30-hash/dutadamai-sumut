// Data tim dan aturan pengelolaannya. Sumber tunggal untuk halaman publik dan menu admin.
// Nama di data ini berasal dari UI_Versi7 dan belum dikonfirmasi. Ubah lewat menu Akun tim.

export interface AnggotaTim {
  id: string;
  nama: string;
  peran: string;
  divisi: string;
  /** Hanya anggota yang setuju yang profilnya tampil di halaman publik. */
  tampil: boolean;
}

export const DIVISI_AWAL = ['Blogger', 'Editor', 'DKV', 'IT'] as const;

export const TIM_CONTOH: AnggotaTim[] = [
  { id: 't1', nama: 'Nadia Amalia', peran: 'Penulis · Cerita Sumut', divisi: 'Blogger', tampil: true },
  { id: 't2', nama: 'Yosua Sinaga', peran: 'Penulis · Opini & Tips Skill', divisi: 'Blogger', tampil: true },
  { id: 't3', nama: 'Putri Lubis', peran: 'Editor · menyeleksi karya masuk dan memoderasi komentar', divisi: 'Editor', tampil: true },
  { id: 't4', nama: 'Raka Kurniawan', peran: 'Desainer · cover & ilustrasi', divisi: 'DKV', tampil: true },
  { id: 't5', nama: 'Sarah Manurung', peran: 'Desainer · template kartu bagikan', divisi: 'DKV', tampil: true },
  { id: 't6', nama: 'Aldi Harahap', peran: 'Desainer · infografis', divisi: 'DKV', tampil: true },
  { id: 't7', nama: 'Fikri Kesuma', peran: 'Admin · koordinator IT', divisi: 'IT', tampil: true },
  { id: 't8', nama: 'Jessica Tan', peran: 'Developer · frontend', divisi: 'IT', tampil: true },
  { id: 't9', nama: 'Bima Pratama', peran: 'Developer · backend', divisi: 'IT', tampil: true },
];

export type HasilTim = { ok: true } | { ok: false; alasan: string };

/** Anggota yang tampil, dikelompokkan per divisi sesuai urutan divisi. */
export function kelompokkanPublik(anggota: AnggotaTim[], divisi: readonly string[]) {
  return divisi
    .map((d) => ({ divisi: d, anggota: anggota.filter((a) => a.tampil && a.divisi === d) }))
    .filter((k) => k.anggota.length > 0);
}

/** Jumlah anggota yang tampil di halaman publik. */
export function hitungTampil(anggota: AnggotaTim[]): number {
  return anggota.filter((a) => a.tampil).length;
}

export function validasiAnggota(input: { nama: string; peran: string; divisi: string }): HasilTim {
  if (!input.nama.trim()) return { ok: false, alasan: 'Nama wajib diisi.' };
  if (!input.peran.trim()) return { ok: false, alasan: 'Peran wajib diisi.' };
  if (!input.divisi.trim()) return { ok: false, alasan: 'Pilih divisi.' };
  return { ok: true };
}
