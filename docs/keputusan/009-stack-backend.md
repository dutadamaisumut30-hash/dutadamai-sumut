# 009: Stack backend

- Status: usulan, menunggu ACC tim
- Keputusan usulan:
  - Database: PostgreSQL 18 di Docker, di VPS (ADR 008).
  - ORM dan migrasi: Drizzle ORM. Skema ada di `src/lib/db/schema`.
  - Login: Better Auth dengan plugin admin dan 2FA (TOTP). Satu peran per akun (ADR 002).
  - Form publik: Cloudflare Turnstile, batas laju per IP yang disimpan dalam bentuk hash.
  - Berkas (cover, kiriman karya): Cloudflare R2, batas 5 MB per berkas.
  - Reverse proxy dan HTTPS: Caddy di VPS.
  - Deploy: GitHub Actions, image ke GHCR.
  - Statistik: Umami, menyusul setelah backend.
- Alasan: sudah tercantum di rencana (`02-status-kode`). Better Auth sudah dipilih di ADR 002. VPS dipakai sejak awal (ADR 008).
- Konsekuensi:
  - Kontak pengirim dienkripsi dan dihapus 30 hari setelah keputusan final (ADR 005). Kunci enkripsi disimpan di password manager bersama (ADR 004).
  - Backup PostgreSQL harian dan uji pemulihan sekali sebulan.
  - Vercel tidak dipakai untuk produksi. Hanya untuk uji coba (ADR 008).
