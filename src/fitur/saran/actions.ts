'use server';

// Server action kotak saran. Hanya aktif jika BACKEND_SIAP true.
import { dbTunggal } from '@/lib/db/tunggal';
import { kunciDariEnv } from '@/lib/kripto-kontak';
import { BACKEND_SIAP, PESAN_BELUM_TERSAMBUNG } from '@/lib/status-sistem';
import { cekTurnstile } from '@/lib/turnstile';
import { ambilIp, izinkan, kunciIp } from '@/lib/batas-laju';
import { layananKirimSaran, type HasilSaran } from './layanan';

export type { HasilSaran };

export async function kirimSaran(input: unknown, turnstile = ''): Promise<HasilSaran> {
  if (!BACKEND_SIAP) return { ok: false, pesan: PESAN_BELUM_TERSAMBUNG };
  const url = process.env.DATABASE_URL;
  const kunciRaw = process.env.KONTAK_ENCRYPTION_KEY;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!url || !kunciRaw || !secret) return { ok: false, pesan: 'Server belum dikonfigurasi. Hubungi tim IT.' };

  const ip = await ambilIp();
  if (!izinkan(kunciIp(ip, 'kirim_saran'), 10, 10 * 60_000)) {
    return { ok: false, pesan: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' };
  }

  return layananKirimSaran(input, { turnstile, ip }, {
    db: dbTunggal(url),
    kunci: kunciDariEnv(kunciRaw),
    secretTurnstile: secret,
    cekTurnstile,
  });
}
