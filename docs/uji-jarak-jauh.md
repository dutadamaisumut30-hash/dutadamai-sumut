# Uji coba tim dari jarak jauh

GitHub hanya menyimpan kode. Tim butuh aplikasi yang berjalan dan database. Ada tiga jalan:

## A. Malam ini: tunnel dari laptop (gratis, 10 menit)
Laptopmu tetap menyala selama tim menguji.
1. Jalankan versi produksi lokal: `npx --yes pnpm@10 build` lalu `npx --yes pnpm@10 start`.
2. Di terminal lain: `cloudflared tunnel --url http://localhost:3000` (pasang cloudflared dulu). Salin alamat `https://xxxx.trycloudflare.com`.
3. Isi `.env`, lalu mulai ulang server:
   ```
   BETTER_AUTH_URL=https://xxxx.trycloudflare.com
   BETTER_AUTH_TRUSTED_ORIGINS=https://xxxx.trycloudflare.com
   ALLOWED_ORIGINS=xxxx.trycloudflare.com
   NEXT_PUBLIC_MODE_UJI=1
   NEXT_PUBLIC_SANDI_UJI=<sandi akun uji>
   WAJIB_2FA=0
   ```
   (Build ulang setelah mengubah variabel NEXT_PUBLIC_*.)
4. Kirim alamat tunnel ke tim. Di /masuk ada tombol "Masuk sebagai Blogger/DKV/Editor".
Alamat berubah setiap tunnel dimulai ulang. Matikan tunnel setelah selesai.

## B. Staging di VPS (disarankan, sekaligus latihan Fase 5)
Subdomain `staging.<domain>` dengan HTTPS, database terpisah, `WAJIB_2FA=0`, dan `NEXT_PUBLIC_MODE_UJI=1`. Lindungi dengan basic auth di Nginx supaya hanya tim yang bisa membuka. Data uji tidak bercampur dengan data asli.

## C. GitHub Codespaces
Bisa menjalankan aplikasi dan Postgres, tetapi tiap penguji butuh akses ke repositori. Kurang praktis.

## Setelah tayang
`NEXT_PUBLIC_MODE_UJI` dan `WAJIB_2FA=0` harus dihapus. Editor dan Admin wajib 2FA di produksi.
