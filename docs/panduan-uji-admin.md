# Panduan uji Ruang Redaksi (untuk Admin)

## Dua jenis "tim", jangan tertukar
- **Akun login** (Better Auth): orang yang bisa masuk ke `/redaksi`. Dibuat lewat `scripts/buat-akun.ts`, bukan lewat web.
- **Daftar tim publik** (menu *Akun tim*): hanya nama yang tampil di halaman `/tim`. Tidak bisa dipakai login.

## Fungsi tiap menu
| Menu | Siapa | Gunanya |
|---|---|---|
| Admin | Admin | Pintu masuk semua fitur + tabel hak akses per peran |
| Papan | Editor, Admin | Alur status tulisan: draf, menunggu desain, didesain, review akhir, terbit |
| Tulisanku | Blogger, Editor, Admin | Menulis dan mengajukan draf sendiri |
| Tugas DKV | DKV, Editor, Admin | Mengunggah desain untuk tulisan yang menunggu desain |
| Karya masuk | Editor, Admin | Menyeleksi karya pelajar dari formulir publik |
| Komentar | Editor, Admin | Moderasi komentar pembaca |
| Laporan | Editor, Admin | Laporan konten dari pembaca; tandai ditangani |
| Kotak saran | Editor, Admin | Membaca saran pembaca |
| Rubrik | Editor, Admin | Mengubah deskripsi rubrik |
| Akun tim | Admin | Tambah, ubah, sembunyikan, hapus anggota di halaman Tim |

## Aturan status (diperbarui 23 Nov 2026)
- Maju: satu langkah saja (Draf, Menunggu desain, Didesain, Review akhir, Terbit).
- Mundur atau **tarik dari terbit**: dari status mana pun ke status yang lebih awal, hanya Editor dan Admin, **catatan wajib**. Catatan tampil ke penulis di Tulisanku dan di halaman detail.
- Tulisan yang ditarik dari terbit langsung hilang dari situs publik.

## Cover dan komentar
- Cover: DKV, Editor, dan Admin mengunggah PNG/JPG di halaman detail tulisan (bisa dihapus lewat tombol Hapus). Gambar terbaru jadi sampul di beranda dan halaman berita.
- Komentar: pembaca mengirim di bawah artikel, status awal Menunggu. Editor/Admin menyetujui di tab Komentar, baru tampil di bawah artikel. Lencana merah di tab menunjukkan antrean.

## CRUD per modul (jujur)
| Modul | Tambah | Lihat | Ubah | Hapus |
|---|---|---|---|---|
| Anggota tim | ya | ya | ya | **ya (baru)** |
| Rubrik | tetap (3 rubrik) | ya | deskripsi | tidak, sengaja |
| Tulisan | ya (draf) | ya | ya | draf bisa dihapus; yang terbit ditarik lewat mundur status |
| Berkas cover | ya (DKV/Editor/Admin) | ya | ganti dengan unggah baru | ya |
| Karya pelajar | publik kirim | ya | seleksi/status | kontak otomatis dihapus 30 hari (ADR 005) |
| Komentar | publik kirim | ya | moderasi status | disembunyikan lewat status |
| Laporan | publik kirim | ya | tandai ditangani | tidak |
| Saran | publik kirim | ya | tidak | tidak |

## Tes cepat sebagai Admin (sekitar 10 menit)
1. Akun tim: tambah "Uji Satu", ubah nama dan divisi, sembunyikan, cek `/tim`, lalu Hapus (konfirmasi dua langkah).
2. Tulisanku: buat draf berjudul "DEMO", simpan, ajukan.
3. Papan: geser DEMO sampai terbit, buka di situs.
4. Komentar: kirim komentar dari situs, moderasi di menu Komentar.
5. Laporan dan Kotak saran: kirim dari situs, cek muncul.
6. Ganti peran akun uji (editor.uji, dkv.uji, blogger.uji) dan pastikan tab yang tampil sesuai tabel di atas.

## Membuat akun uji (PowerShell, dari folder proyek)
```
$env:AKUN_KATA_SANDI="isi-sandi-uji-kamu"
npx tsx --env-file=.env scripts/buat-akun.ts editor.uji@contoh.test "Editor Uji" editor
```
Ganti `editor` dengan `dkv` atau `blogger`. Hapus akun uji sebelum pilot.

## Pembaruan 23 Nov 2026 (malam)
- Hapus tulisan permanen: Editor dan Admin, status apa pun, lewat halaman detail tulisan (tombol "Hapus tulisan permanen", dua langkah). Komentar dan berkas ikut terhapus. Untuk menyembunyikan saja, pakai "Tarik dari terbit".
- Hapus draf: pemilik draf di Tulisanku (hanya status draf).
- Statistik: tab Statistik untuk semua peran tim. Blogger melihat tulisan miliknya; DKV, Editor, dan Admin melihat seluruh tulisan; Editor dan Admin juga melihat kotak masuk redaksi. Kunjungan pembaca menunggu Umami (Fase 5).
- /sitemap.xml, /robots.txt, /feed.xml (RSS) tersedia. Atur NEXT_PUBLIC_SITE_URL saat tayang.
- Form publik menampilkan keterangan "Menunggu verifikasi keamanan" sampai Turnstile selesai.
- Tulisanku dikelompokkan per status dan bisa dilipat.

## Pembaruan 23 Nov 2026 (larut)
- Hapus tulisan permanen: Papan, klik "Detail, cover, atau hapus →" pada kartu, lalu di panel kanan bagian "Zona berbahaya".
- Ikon orang di navbar publik dan tautan "Masuk tim" di footer membuka /masuk. Yang sudah masuk langsung diarahkan ke ruang kerjanya.
- Mode uji di /masuk (tombol "Masuk sebagai ...") hanya aktif jika NEXT_PUBLIC_MODE_UJI=1. Jangan aktifkan di produksi.
- Bersihkan file uji: `npx tsx --env-file=.env scripts/bersihkan-penyimpanan.ts` (laporan), tambahkan `--hapus` untuk menghapus.
- Keamanan produksi: CSP, HSTS, batas percobaan masuk (5 per menit), 2FA wajib untuk Editor dan Admin.
