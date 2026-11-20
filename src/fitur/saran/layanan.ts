// Kotak saran ke database. Validasi, verifikasi Turnstile, lalu simpan. Kontak (jika ada) terenkripsi (ADR 005).
import { z } from 'zod';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { saran } from '@/lib/db/schema';
import { enkripsiKontak } from '@/lib/kripto-kontak';
import type { CekTurnstile } from '@/lib/turnstile';

export const skemaSaran = z.object({
  kategori: z.enum(['Saran konten', 'Masalah teknis', 'Ide kolaborasi']),
  pesan: z.string().trim().min(10, 'Pesan minimal 10 karakter.').max(2000, 'Pesan maksimal 2000 karakter.'),
  kontak: z.string().trim().max(120, 'Kontak maksimal 120 karakter.').optional().default(''),
});

export type HasilSaran = { ok: true } | { ok: false; pesan: string };

export interface DepsSaran {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: PgDatabase<any, any, any>;
  kunci: Buffer;
  secretTurnstile: string;
  cekTurnstile: CekTurnstile;
}

export async function layananKirimSaran(
  input: unknown,
  opsi: { turnstile: string; ip?: string },
  deps: DepsSaran,
): Promise<HasilSaran> {
  const hasil = skemaSaran.safeParse(input);
  if (!hasil.success) return { ok: false, pesan: hasil.error.issues[0]?.message ?? 'Data belum lengkap.' };
  const data = hasil.data;

  const lolos = await deps.cekTurnstile({ token: opsi.turnstile, secret: deps.secretTurnstile, ip: opsi.ip });
  if (!lolos) return { ok: false, pesan: 'Verifikasi keamanan gagal. Muat ulang halaman lalu coba lagi.' };

  try {
    await deps.db.insert(saran).values({
      kategori: data.kategori,
      pesan: data.pesan,
      kontakTerenkripsi: data.kontak ? enkripsiKontak(data.kontak, deps.kunci) : null,
      status: 'baru',
    });
  } catch {
    return { ok: false, pesan: 'Masukanmu belum tersimpan. Coba lagi beberapa saat lagi.' };
  }
  return { ok: true };
}
