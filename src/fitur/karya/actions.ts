'use server';

// Server action kirim karya. Hanya aktif jika BACKEND_SIAP true (setelah database, Turnstile, dan batas laju diuji).
import { dbTunggal } from '@/lib/db/tunggal';
import { kunciDariEnv } from '@/lib/kripto-kontak';
import { buatKodeLacak } from '@/lib/kode-lacak';
import { BACKEND_SIAP, PESAN_BELUM_TERSAMBUNG } from '@/lib/status-sistem';
import { cekTurnstile } from '@/lib/turnstile';
import { layananKirimKarya, type HasilKirim } from './layanan';

export type { HasilKirim };

export async function kirimKarya(input: unknown, turnstile = ''): Promise<HasilKirim> {
  if (!BACKEND_SIAP) return { ok: false, pesan: PESAN_BELUM_TERSAMBUNG };

  const url = process.env.DATABASE_URL;
  const kunciRaw = process.env.KONTAK_ENCRYPTION_KEY;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!url || !kunciRaw || !secret) {
    return { ok: false, pesan: 'Server belum dikonfigurasi. Hubungi tim IT.' };
  }

  return layananKirimKarya(input, { turnstile }, {
    db: dbTunggal(url),
    kunci: kunciDariEnv(kunciRaw),
    secretTurnstile: secret,
    cekTurnstile,
    buatKode: buatKodeLacak,
  });
}
