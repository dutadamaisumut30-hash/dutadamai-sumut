#!/bin/sh
# Backup harian: dump PostgreSQL dan folder berkas. Simpan 14 hari. Jalankan dari mana saja di VPS.
# Cron (crontab -e), tiap hari 02:15:   15 2 * * * /opt/dutadamai-sumut/docker/backup.sh >> /var/log/dutadamai-backup.log 2>&1
set -eu
cd "$(dirname "$0")/.."
TUJUAN="${BACKUP_DIR:-/var/backups/dutadamai}"
STAMP="$(date +%Y%m%d-%H%M%S)"
DC="docker compose --env-file docker/produksi.env -f docker/compose.prod.yml"
mkdir -p "$TUJUAN"

$DC exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB"' > "$TUJUAN/db-$STAMP.dump.tmp"
[ -s "$TUJUAN/db-$STAMP.dump.tmp" ] || { echo "Dump database kosong, backup gagal."; exit 1; }
mv "$TUJUAN/db-$STAMP.dump.tmp" "$TUJUAN/db-$STAMP.dump"

$DC exec -T web tar -C /data -cf - penyimpanan > "$TUJUAN/berkas-$STAMP.tar.tmp"
[ -s "$TUJUAN/berkas-$STAMP.tar.tmp" ] || { echo "Arsip berkas kosong, backup gagal."; exit 1; }
mv "$TUJUAN/berkas-$STAMP.tar.tmp" "$TUJUAN/berkas-$STAMP.tar"

find "$TUJUAN" -type f \( -name 'db-*.dump' -o -name 'berkas-*.tar' \) -mtime +14 -delete
echo "Backup selesai: $STAMP"
