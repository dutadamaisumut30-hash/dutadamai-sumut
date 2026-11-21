// ADR 005: kontak pengirim dihapus 30 hari setelah keputusan final. Dijalankan terjadwal (scripts/hapus-kontak.ts).
import { and, inArray, isNotNull, isNull, lte } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { karya } from '@/lib/db/schema';
import { catatAudit } from '@/lib/audit';
import { tanggalHapusKontak } from './kontak-retensi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export interface HasilHapusKontak {
  dijadwalkan: number;
  dihapus: number;
}

/**
 * 1) Karya yang sudah terbit atau ditolak tetapi belum punya tanggal hapus (data lama) diberi tanggal 30 hari dari sekarang.
 * 2) Kontak yang tanggal hapusnya sudah lewat dikosongkan. Karyanya sendiri tetap ada.
 */
export async function hapusKontakKedaluwarsa(db: Db, sekarang: Date = new Date()): Promise<HasilHapusKontak> {
  const jadwal = await db
    .update(karya)
    .set({ kontakHapusPada: tanggalHapusKontak(sekarang) })
    .where(and(inArray(karya.tahap, ['terbit', 'ditolak']), isNull(karya.kontakHapusPada), isNotNull(karya.kontakTerenkripsi)))
    .returning({ id: karya.id });

  const hapus = await db
    .update(karya)
    .set({ kontakTerenkripsi: null })
    .where(and(isNotNull(karya.kontakTerenkripsi), isNotNull(karya.kontakHapusPada), lte(karya.kontakHapusPada, sekarang)))
    .returning({ id: karya.id });

  if (jadwal.length > 0 || hapus.length > 0) {
    await catatAudit(db, {
      peran: 'sistem',
      aksi: 'hapus_kontak_kedaluwarsa',
      objek: 'karya',
      catatan: `${hapus.length} kontak dihapus, ${jadwal.length} dijadwalkan`,
    });
  }
  return { dijadwalkan: jadwal.length, dihapus: hapus.length };
}
