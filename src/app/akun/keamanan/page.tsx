import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { KeamananAkun } from '@/components/akun/KeamananAkun';
import { TombolKeluar } from '@/components/akun/TombolKeluar';

export const metadata = { title: 'Keamanan akun', robots: { index: false, follow: false } };

export default async function HalamanKeamanan() {
  const sesi = await auth.api.getSession({ headers: await headers() });
  if (!sesi) redirect('/masuk');
  return (
    <main className="halaman-tengah">
      <KeamananAkun email={sesi.user.email} sudahAktif={Boolean(sesi.user.twoFactorEnabled)} />
      <TombolKeluar />
    </main>
  );
}
