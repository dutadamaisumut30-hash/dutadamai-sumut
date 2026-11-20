'use server';

// Server action kotak saran. Hanya aktif jika BACKEND_SIAP true.
import { dbTunggal } from '@/lib/db/tunggal';
import { kunciDariEnv } from '@/lib/kripto-kontak';
import { BACKEND_SIAP, PESAN_BELUM_TERSAMBUNG } from '@/lib/status-sistem';
import { cekTurnstile } from '@/lib/turnstile';
import { layananKirimSaran, type HasilSaran } from './layanan';

export type { HasilSaran };

export async function kirimSaran(input: unknown, turnstile = ''): Promise<HasilSaran> {
  if (!BACKEND_SIAP) return { ok: false, pesan: PESAN_BELUM_TERSAMBUNG };
  const url = process.env.DATABASE_URL;
  const kunciRaw = process.env.KONTAK_ENCRYPTION_KEY;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!url || !kunciRaw || !secret) return { ok: false, pesan: 'Server belum dikonfigurasi. Hubungi tim IT.' };

  return layananKirimSaran(input, { turnstile }, {
    db: dbTunggal(url),
    kunci: kunciDariEnv(kunciRaw),
    secretTurnstile: secret,
    cekTurnstile,
  });
}
