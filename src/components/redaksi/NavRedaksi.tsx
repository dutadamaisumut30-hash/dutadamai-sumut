'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TombolKeluar } from '@/components/akun/TombolKeluar';
import './nav-redaksi.css';

export type TabRedaksi = { href: string; label: string; lencana?: number };

// Kerangka tetap ruang redaksi: logo, peran, menu sesuai hak akses, dan tombol keluar.
export function NavRedaksi({ nama, peran, tab }: { nama: string; peran: string; tab: TabRedaksi[] }) {
  const path = usePathname();
  // Tab dengan alamat paling panjang yang cocok yang dianggap aktif (supaya /redaksi tidak menyala di semua halaman).
  const aktif = tab
    .filter((t) => path === t.href || path.startsWith(t.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <header className="rd-bar">
      <div className="wrap rd-atas">
        <Link href="/" className="rd-brand" aria-label="Ke situs DutaDamai Sumut">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/logo-dutadamai-sumut.png" alt="" width={128} height={55} />
          <span className="rd-label">Ruang redaksi</span>
        </Link>
        <div className="rd-user">
          <span className="rd-nama" title={nama}>{nama}</span>
          <span className="rd-peran">{peran}</span>
          <Link href="/akun/keamanan" className="rd-link">Akun</Link>
          <Link href="/" className="rd-link">Lihat situs</Link>
          <TombolKeluar />
        </div>
      </div>
      <nav className="wrap rd-tab" aria-label="Menu ruang redaksi">
        {tab.map((t) => (
          <Link key={t.href} href={t.href} className={t.href === aktif ? 'on' : ''} aria-current={t.href === aktif ? 'page' : undefined}>
            {t.label}
            {t.lencana ? <span className="rd-lencana" aria-label={`${t.lencana} menunggu`}>{t.lencana > 99 ? '99+' : t.lencana}</span> : null}
          </Link>
        ))}
      </nav>
    </header>
  );
}
