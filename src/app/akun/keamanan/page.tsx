import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { KeamananAkun } from '@/components/akun/KeamananAkun';
import { TombolKeluar } from '@/components/akun/TombolKeluar';
import Link from 'next/link';

const RUANG_KERJA: Record<string, { href: string; label: string }> = {
  blogger: { href: '/redaksi/tulis', label: 'Tulisanku' },
  dkv: { href: '/redaksi/dkv', label: 'Tugas desain' },
  editor: { href: '/redaksi', label: 'Papan redaksi' },
  admin: { href: '/redaksi/admin', label: 'Admin redaksi' },
};

export const metadata = { title: 'Keamanan akun', robots: { index: false, follow: false } };

export default async function HalamanKeamanan() {
  const sesi = await auth.api.getSession({ headers: await headers() });
  if (!sesi) redirect('/masuk');
  const ruang = RUANG_KERJA[String(sesi.user.peran ?? '')];
  return (
    <main className="halaman-tengah">
      {ruang && <p><Link href={ruang.href}>Buka ruang kerja: {ruang.label} →</Link></p>}
      <KeamananAkun email={sesi.user.email} sudahAktif={Boolean(sesi.user.twoFactorEnabled)} />
      <TombolKeluar />
    </main>
  );
}
