'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { dbTunggal } from '@/lib/db/tunggal';
import { bolehAksi, PERAN, type Peran } from '@/lib/izin';
import type { StatusKomentar } from '@/fitur/moderasi/komentar';
import { ambilIp, izinkan, kunciIp } from '@/lib/batas-laju';
import { BACKEND_SIAP, PESAN_BELUM_TERSAMBUNG } from '@/lib/status-sistem';
import { cekTurnstile } from '@/lib/turnstile';
import { ambilSemuaKomentar, kirimKomentar, ubahStatusKomentar } from './layanan';

export async function kirimKomentarPublik(tulisanId: string, input: unknown, turnstile = '') {
  if (!BACKEND_SIAP) return { ok: false as const, pesan: PESAN_BELUM_TERSAMBUNG };
  const url = process.env.DATABASE_URL;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!url || !secret) return { ok: false as const, pesan: 'Server belum dikonfigurasi. Hubungi tim IT.' };

  const ip = await ambilIp();
  if (!izinkan(kunciIp(ip, 'kirim_komentar'), 5, 10 * 60_000)) {
    return { ok: false as const, pesan: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' };
  }
  const lolos = await cekTurnstile({ token: turnstile, secret, ip });
  if (!lolos) return { ok: false as const, pesan: 'Verifikasi keamanan gagal. Muat ulang halaman lalu coba lagi.' };

  return kirimKomentar(dbTunggal(url), tulisanId, input);
}

function urlDb(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL belum diatur.');
  return url;
}

async function peranModerator(): Promise<Peran> {
  const sesi = await auth.api.getSession({ headers: await headers() });
  const peran = sesi?.user.peran as string | null | undefined;
  if (!peran || !(PERAN as readonly string[]).includes(peran) || !bolehAksi(peran as Peran, 'moderasi')) {
    throw new Error('Tidak diizinkan.');
  }
  return peran as Peran;
}

export async function muatKomentar() {
  await peranModerator();
  return ambilSemuaKomentar(dbTunggal(urlDb()));
}

export async function gantiStatusKomentar(id: string, ke: StatusKomentar) {
  const peran = await peranModerator();
  return ubahStatusKomentar(dbTunggal(urlDb()), id, ke, peran);
}
