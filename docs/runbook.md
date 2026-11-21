# Runbook

Panduan operasi di VPS (ADR 008). Semua perintah dijalankan dari akar repo di server, misalnya `/opt/dutadamai-sumut`.
Singkatan di bawah: `DC` = `docker compose --env-file docker/produksi.env -f docker/compose.prod.yml`

## Deploy pertama

1. Pasang Docker dan Git di VPS. Buka port 80 dan 443 saja di firewall.
2. Arahkan DNS domain (record A) ke IP VPS, tunggu aktif.
3. `git clone` repo ke `/opt/dutadamai-sumut`, lalu `git checkout main` (atau cabang rilis).
4. `cp docker/produksi.env.example docker/produksi.env`, isi semua nilai. Rahasia acak: `openssl rand -base64 32`. `KONTAK_ENCRYPTION_KEY` harus baru dan disalin ke password manager bersama.
5. `DC up -d --build`. Migrasi berjalan otomatis sebelum aplikasi menyala.
6. Buat admin pertama (kata sandi minimal 12 karakter):
   `DC run --rm -e AKUN_KATA_SANDI='...' migrasi pnpm exec tsx scripts/buat-akun.ts email@domain "Nama" admin`
   Setelah login, langsung aktifkan 2FA di /akun/keamanan.
7. Isi rubrik dan anggota tim awal: `DC run --rm migrasi pnpm exec tsx scripts/seed-papan.ts` (hanya jika tabelnya masih kosong).
8. Pasang backup harian: `crontab -e`, tambahkan
   `15 2 * * * /opt/dutadamai-sumut/docker/backup.sh >> /var/log/dutadamai-backup.log 2>&1`
9. Pasang penghapusan kontak otomatis (ADR 005, wajib sebelum pilot). Tambahkan di crontab yang sama:
   `45 2 * * * cd /opt/dutadamai-sumut && docker compose --env-file docker/produksi.env -f docker/compose.prod.yml run --rm migrasi pnpm exec tsx scripts/hapus-kontak.ts >> /var/log/dutadamai-hapus-kontak.log 2>&1`
   Cek log setelah hari pertama. Barisnya berbunyi `Selesai: N kontak dihapus, M dijadwalkan.`

## Cek kesehatan

- `DC ps`: semua layanan `running`, web `healthy`.
- `DC logs --tail=100 web` untuk galat aplikasi, `DC logs --tail=100 caddy` untuk HTTPS.

## Situs mati

1. `DC ps`. Jika ada layanan mati: `DC up -d`.
2. Web tidak healthy: lihat `DC logs --tail=200 web`. Penyebab umum: variabel di `produksi.env` salah atau database belum siap.
3. HTTPS gagal: pastikan DNS mengarah ke VPS dan port 80/443 terbuka, lalu `DC logs caddy`.
4. Disk penuh: `df -h`, bersihkan backup lama di `/var/backups/dutadamai` dan `docker system prune`.

## Update versi

1. Backup dulu: `docker/backup.sh`.
2. `git pull`, lalu `TAG=$(git rev-parse --short HEAD) DC up -d --build`.
3. Migrasi hanya boleh menambah kolom atau tabel, supaya rollback aman.

## Rollback

`git checkout <commit-sebelumnya>`, lalu `TAG=<commit-sebelumnya> DC up -d --build`.
Jika migrasi terakhir menambah kolom, versi lama tetap berjalan (kolom tambahan diabaikan).

## Restore backup

Uji pemulihan sekali sebulan di server cadangan, bukan di produksi.

```sh
# Database (berkas db-YYYYMMDD-HHMMSS.dump)
DC stop web
DC exec -T db sh -c 'dropdb -U "$POSTGRES_USER" --if-exists "$POSTGRES_DB" && createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'
DC exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner' < /var/backups/dutadamai/db-XXXX.dump
# Berkas (berkas berkas-YYYYMMDD-HHMMSS.tar)
DC start web
DC exec -T web tar -C /data -xf - < /var/backups/dutadamai/berkas-XXXX.tar
```

Backup tersimpan di VPS yang sama. Salin berkala ke tempat lain (komputer pembina atau penyimpanan cloud), karena kalau VPS hilang backup ikut hilang.

## Kunci enkripsi hilang atau bocor

- Hilang: kontak pengirim yang sudah tersimpan tidak bisa dibaca lagi. Kontak baru tetap aman dengan kunci baru.
- Bocor: buat kunci baru dan ganti di `produksi.env`. Kontak lama perlu dienkripsi ulang, jadi hubungi pengembang.
