import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { bolehAksi, PERAN, type Aksi, type Peran } from '@/lib/izin';

export type Gerbang = { ok: true; peran: Peran } | { ok: false; alasan: string };

/** Memastikan pengguna login dan peran-nya boleh menjalankan aksi. Dipakai oleh server action. */
export async function gerbangAksi(aksi: Aksi, pesanTolak: string): Promise<Gerbang> {
  const sesi = await auth.api.getSession({ headers: await headers() });
  const peran = sesi?.user.peran as string | null | undefined;
  if (!peran || !(PERAN as readonly string[]).includes(peran) || !bolehAksi(peran as Peran, aksi)) {
    return { ok: false, alasan: pesanTolak };
  }
  return { ok: true, peran: peran as Peran };
}
