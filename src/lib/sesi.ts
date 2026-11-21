import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { bolehAksi, PERAN, type Aksi, type Peran } from '@/lib/izin';

// Dipakai di halaman server /redaksi. Tanpa login, atau tanpa izin untuk aksi ini, pengguna dialihkan ke /masuk.
export async function wajibAksi(aksi: Aksi) {
  const sesi = await auth.api.getSession({ headers: await headers() });
  if (!sesi) redirect('/masuk');
  const peran = sesi.user.peran as string | null | undefined;
  if (!peran || !(PERAN as readonly string[]).includes(peran) || !bolehAksi(peran as Peran, aksi)) redirect('/masuk');
  return sesi;
}

// Untuk layout /redaksi: cukup anggota tim. Izin per halaman tetap dicek oleh wajibAksi di halaman itu sendiri.
export async function wajibAnggotaTim() {
  const sesi = await auth.api.getSession({ headers: await headers() });
  if (!sesi) redirect('/masuk');
  const peran = sesi.user.peran as string | null | undefined;
  if (!peran || peran === 'publik' || !(PERAN as readonly string[]).includes(peran)) redirect('/masuk');
  return sesi;
}
