// Laporan konten dari pengunjung. Validasi, verifikasi Turnstile, simpan. Moderasi oleh Editor dan Admin.
import { asc, desc, eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { ALASAN_LAPORAN, laporan } from '@/lib/db/schema';
import { catatAudit } from '@/lib/audit';
import { bolehAksi, type Peran } from '@/lib/izin';
import type { CekTurnstile } from '@/lib/turnstile';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export const skemaLaporan = z
  .object({
    alasan: z.enum(ALASAN_LAPORAN),
    catatan: z.string().trim().max(1000, 'Catatan maksimal 1000 karakter.').optional().default(''),
    alamat: z.string().trim().max(300, 'Alamat maksimal 300 karakter.').optional().default(''),
  })
  .refine((d) => d.alasan !== 'Lainnya' || d.catatan.length >= 10, {
    message: 'Jelaskan laporanmu di catatan (minimal 10 karakter).',
    path: ['catatan'],
  });

export type HasilLaporan = { ok: true } | { ok: false; pesan: string };

export interface DepsLaporan {
  db: Db;
  secretTurnstile: string;
  cekTurnstile: CekTurnstile;
}

export async function layananKirimLaporan(
  input: unknown,
  opsi: { turnstile: string; ip?: string },
  deps: DepsLaporan,
): Promise<HasilLaporan> {
  const hasil = skemaLaporan.safeParse(input);
  if (!hasil.success) return { ok: false, pesan: hasil.error.issues[0]?.message ?? 'Data belum lengkap.' };

  const lolos = await deps.cekTurnstile({ token: opsi.turnstile, secret: deps.secretTurnstile, ip: opsi.ip });
  if (!lolos) return { ok: false, pesan: 'Verifikasi keamanan gagal. Muat ulang halaman lalu coba lagi.' };

  try {
    await deps.db.insert(laporan).values({
      alasan: hasil.data.alasan,
      catatan: hasil.data.catatan,
      alamat: hasil.data.alamat,
    });
  } catch {
    return { ok: false, pesan: 'Laporanmu belum tersimpan. Coba lagi beberapa saat lagi.' };
  }
  await catatAudit(deps.db, { peran: 'publik', aksi: 'kirim_laporan', objek: 'laporan', catatan: hasil.data.alasan });
  return { ok: true };
}

export interface LaporanDb {
  id: string;
  alasan: string;
  catatan: string;
  alamat: string;
  status: 'baru' | 'ditangani';
  diterima: string;
}

function tanggalPendek(d: Date): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).format(d);
}

/** Laporan baru tampil di atas, lalu yang terbaru. */
export async function ambilLaporan(db: Db): Promise<LaporanDb[]> {
  const baris = await db.select().from(laporan).orderBy(asc(laporan.status), desc(laporan.dibuatPada));
  return baris.map((b: any) => ({
    id: b.id,
    alasan: b.alasan,
    catatan: b.catatan,
    alamat: b.alamat,
    status: b.status,
    diterima: tanggalPendek(b.dibuatPada),
  }));
}

export async function tandaiLaporanDitangani(
  db: Db,
  id: string,
  peran: Peran,
): Promise<{ ok: true } | { ok: false; alasan: string }> {
  if (!bolehAksi(peran, 'moderasi')) return { ok: false, alasan: 'Hanya Editor dan Admin yang boleh menangani laporan.' };
  try {
    const diubah = await db
      .update(laporan)
      .set({ status: 'ditangani' })
      .where(eq(laporan.id, id))
      .returning({ id: laporan.id });
    if (diubah.length === 0) return { ok: false, alasan: 'Laporan tidak ditemukan.' };
    await catatAudit(db, { peran, aksi: 'tangani_laporan', objek: 'laporan', objekId: id });
    return { ok: true };
  } catch {
    return { ok: false, alasan: 'Perubahan belum tersimpan. Coba lagi.' };
  }
}
