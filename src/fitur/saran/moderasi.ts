import { and, desc, eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { saran } from '@/lib/db/schema';
import { catatAudit } from '@/lib/audit';
import type { Peran } from '@/lib/izin';
import { pindahSaran, type HasilSaran, type StatusSaran } from './alur-saran';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export interface SaranMasukDb {
  id: string;
  kategori: 'Saran konten' | 'Masalah teknis' | 'Ide kolaborasi';
  pesan: string;
  status: StatusSaran;
  diterima: string;
}

function tanggalPendek(d: Date): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).format(d);
}

/** Semua saran, terbaru dulu. Kontak terenkripsi sengaja tidak diambil. */
export async function ambilSaranMasuk(db: Db): Promise<SaranMasukDb[]> {
  const baris = await db
    .select({ id: saran.id, kategori: saran.kategori, pesan: saran.pesan, status: saran.status, diterimaPada: saran.diterimaPada })
    .from(saran)
    .orderBy(desc(saran.diterimaPada));
  return baris.map((b: any) => ({
    id: b.id,
    kategori: b.kategori,
    pesan: b.pesan,
    status: b.status,
    diterima: tanggalPendek(b.diterimaPada),
  }));
}

/** Memindahkan status saran. Aturan perpindahan ada di pindahSaran. */
export async function gantiStatusSaran(db: Db, id: string, ke: StatusSaran, peran: Peran): Promise<HasilSaran> {
  try {
    const [s] = await db.select({ status: saran.status }).from(saran).where(eq(saran.id, id));
    if (!s) return { ok: false, alasan: 'Saran tidak ditemukan.' };
    const cek = pindahSaran({ dari: s.status, ke, peran });
    if (!cek.ok) return cek;

    // Syarat status lama menjaga agar dua editor yang menekan bersamaan tidak saling menimpa.
    const diubah = await db
      .update(saran)
      .set({ status: ke })
      .where(and(eq(saran.id, id), eq(saran.status, s.status)))
      .returning({ id: saran.id });
    if (diubah.length === 0) return { ok: false, alasan: 'Status saran baru saja berubah. Muat ulang halaman.' };

    await catatAudit(db, { peran, aksi: 'ubah_status_saran', objek: 'saran', objekId: id, catatan: `${s.status} -> ${ke}` });
    return { ok: true };
  } catch {
    return { ok: false, alasan: 'Perubahan belum tersimpan. Coba lagi.' };
  }
}
