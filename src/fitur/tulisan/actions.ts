'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { dbTunggal } from '@/lib/db/tunggal';
import { PERAN, type Peran } from '@/lib/izin';
import type { StatusTulisan } from './alur-status';
import { ambilPapan, ambilTulisan, ubahStatus } from './layanan';

function urlDb(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL belum diatur.');
  return url;
}

async function peranTim(): Promise<Peran> {
  const sesi = await auth.api.getSession({ headers: await headers() });
  const peran = sesi?.user.peran as string | null | undefined;
  if (!peran || peran === 'publik' || !(PERAN as readonly string[]).includes(peran)) {
    throw new Error('Tidak diizinkan.');
  }
  return peran as Peran;
}

export async function muatPapan() {
  await peranTim();
  return ambilPapan(dbTunggal(urlDb()));
}

export async function gantiStatus(
  id: string,
  ke: StatusTulisan,
  catatan?: string,
): Promise<{ ok: true } | { ok: false; pesan: string }> {
  const peran = await peranTim();
  return ubahStatus(dbTunggal(urlDb()), { id, ke, peran, catatan });
}

export async function muatTulisan(id: string) {
  await peranTim();
  return ambilTulisan(dbTunggal(urlDb()), id);
}
