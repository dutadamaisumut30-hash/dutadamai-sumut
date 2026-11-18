import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

const MENU = [
  { href: '/', label: 'Berita' },
  { href: '/rubrik', label: 'Rubrik' },
  { href: '/karya', label: 'Karya Pelajar' },
  { href: '/kirim-karya', label: 'Kirim Karya' },
  { href: '/tim', label: 'Tim' },
  { href: '/tentang', label: 'Tentang' },
];

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap bar">
        <Link href="/" className="brand">
          <span className="dot" aria-hidden="true" />
          DutaDamai Sumut
        </Link>
        <nav className="menu-desktop" aria-label="Menu utama">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href}>{m.label}</Link>
          ))}
        </nav>
        <div className="sp" />
        <Link href="/cari" className="ico hide-m">Cari</Link>
        <ThemeToggle />
        <details className="menu-mobile">
          <summary className="ico">Menu</summary>
          <nav aria-label="Menu mobile">
            {MENU.map((m) => (
              <Link key={m.href} href={m.href}>{m.label}</Link>
            ))}
            <Link href="/cari">Cari</Link>
          </nav>
        </details>
        <Link href="/kirim-karya" className="btn hide-m">Kirim Karya</Link>
      </div>
    </header>
  );
}
