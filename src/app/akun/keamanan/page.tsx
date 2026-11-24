import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { KeamananAkun } from '@/components/akun/KeamananAkun';
import { TombolKeluar } from '@/components/akun/TombolKeluar';
import Link from 'next/link';
import './akun.css';

const RUANG_KERJA: Record<string, { href: string; label: string }> = {
  blogger: { href: '/redaksi/tulis', label: 'Tulisanku' },
  dkv: { href: '/redaksi/dkv', label: 'Tugas desain' },
  editor: { href: '/redaksi', label: 'Papan redaksi' },
  admin: { href: '/redaksi/admin', label: 'Admin redaksi' },
};
const NAMA_PERAN: Record<string, string> = { blogger: 'Blogger', dkv: 'DKV', editor: 'Editor', admin: 'Admin' };

export const metadata = { title: 'Keamanan akun', robots: { index: false, follow: false } };

export default async function HalamanKeamanan({ searchParams }: { searchParams: Promise<{ wajib?: string }> }) {
  const { wajib } = await searchParams;
  const sesi = await auth.api.getSession({ headers: await headers() });
  if (!sesi) redirect('/masuk');
  const peran = String(sesi.user.peran ?? '');
  const ruang = RUANG_KERJA[peran];
  return (
    <main className="akun-halaman">
      <header className="akun-kepala">
        <Link href="/" aria-label="Ke beranda DutaDamai Sumut">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/logo-dutadamai-sumut.png" alt="" width={128} height={55} />
        </Link>
        <div className="akun-id">
          <b>{sesi.user.name}</b>
          {NAMA_PERAN[peran] && <span className="akun-peran">{NAMA_PERAN[peran]}</span>}
          <span className="muted">{sesi.user.email}</span>
        </div>
        {ruang && <Link href={ruang.href} className="btn akun-ruang">Buka ruang kerja: {ruang.label} →</Link>}
      </header>
      {wajib === '2fa' && <div className="warn" role="alert">Akun Editor dan Admin wajib mengaktifkan 2FA sebelum membuka ruang redaksi. Aktifkan di bawah ini.</div>}
      <KeamananAkun sudahAktif={Boolean(sesi.user.twoFactorEnabled)} />
      <div className="akun-keluar"><TombolKeluar /></div>
    </main>
  );
}
