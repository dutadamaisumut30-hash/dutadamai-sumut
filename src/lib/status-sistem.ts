// Saklar status backend. Selama false, formulir publik tidak berpura-pura berhasil:
// karya dan saran tidak dianggap tersimpan. Ubah ke true hanya setelah penyimpanan database,
// Turnstile, dan batas laju per IP sudah aktif dan diuji.
export const BACKEND_SIAP: boolean = true;

export const PESAN_BELUM_TERSAMBUNG =
  'Pengiriman belum tersambung ke server. Karyamu belum tersimpan, jadi formulir ini belum bisa dikirim.';
