import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { bolehAksi, PERAN, type Aksi, type Peran } from '@/lib/izin';

/** Halaman awal yang boleh dibuka oleh peran ini di ruang redaksi. */
export function berandaRedaksi(peran: string | null | undefined): string {
  if (!peran || !(PERAN as readonly string[]).includes(peran)) return '/masuk';
  const p = peran as Peran;
  if (bolehAksi(p, 'ubah_status_review')) return '/redaksi';
  if (bolehAksi(p, 'unggah_desain')) return '/redaksi/dkv';
  if (bolehAksi(p, 'tulis_draf')) return '/redaksi/tulis';
  return '/akun/keamanan';
}

// Dipakai di halaman server /redaksi. Tanpa login, pengguna dialihkan ke /masuk.
// Sudah login tetapi tanpa izin untuk halaman ini: dialihkan ke halaman awal sesuai perannya, bukan ke /masuk.
export async function wajibAksi(aksi: Aksi) {
  const sesi = await auth.api.getSession({ headers: await headers() });
  if (!sesi) redirect('/masuk');
  const peran = sesi.user.peran as string | null | undefined;
  if (!peran || !(PERAN as readonly string[]).includes(peran)) redirect('/masuk');
  if (!bolehAksi(peran as Peran, aksi)) redirect(berandaRedaksi(peran));
  return sesi;
}

// Untuk layout /redaksi: cukup anggota tim. Izin per halaman tetap dicek oleh wajibAksi di halaman itu sendiri.
export async function wajibAnggotaTim() {
  const sesi = await auth.api.getSession({ headers: await headers() });
  if (!sesi) redirect('/masuk');
  const peran = sesi.user.peran as string | null | undefined;
  if (!peran || peran === 'publik' || !(PERAN as readonly string[]).includes(peran)) redirect('/masuk');
  // Produksi: Editor dan Admin wajib mengaktifkan 2FA sebelum memakai ruang redaksi (matikan dengan WAJIB_2FA=0 hanya untuk staging).
  if (process.env.NODE_ENV === 'production' && process.env.WAJIB_2FA !== '0' && (peran === 'editor' || peran === 'admin') && !sesi.user.twoFactorEnabled) {
    redirect('/akun/keamanan?wajib=2fa');
  }
  return sesi;
}
