import type { PgDatabase } from 'drizzle-orm/pg-core';
import { logAudit } from '@/lib/db/schema';

export interface CatatanAudit {
  peran: string;
  aksi: string;
  objek: string;
  objekId?: string | null;
  catatan?: string | null;
}

// Jejak tindakan ke log_audit. Kegagalan hanya dicatat ke konsol agar tindakan utama tidak ikut batal.
export async function catatAudit(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: PgDatabase<any, any, any>,
  data: CatatanAudit,
): Promise<void> {
  try {
    await db.insert(logAudit).values({
      peran: data.peran,
      aksi: data.aksi,
      objek: data.objek,
      objekId: data.objekId ?? null,
      catatan: data.catatan ?? null,
    });
  } catch (err) {
    console.error('[audit] gagal mencatat:', err);
  }
}
