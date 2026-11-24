'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

type Tautan = { href: string; label: string; ket?: string };
type Kolom = { judul: string; items: Tautan[] };
type Item = { id: string; label: string; href: string; kolom?: Kolom[] };

const MENU: Item[] = [
  { id: 'berita', label: 'Berita', href: '/' },
  {
    id: 'rubrik',
    label: 'Rubrik',
    href: '/rubrik',
    kolom: [
      {
        judul: 'Rubrik',
        items: [
          { href: '/rubrik/cerita-sumut', label: 'Cerita Sumut' },
          { href: '/rubrik/opini-pelajar', label: 'Opini Pelajar' },
          { href: '/rubrik/profil-duta', label: 'Profil Duta' },
        ],
      },
      {
        judul: 'Lainnya',
        items: [
          { href: '/rubrik/tips-skill', label: 'Tips Skill' },
          { href: '/rubrik/di-balik-layar', label: 'Di Balik Layar' },
          { href: '/rubrik', label: 'Semua rubrik' },
        ],
      },
      {
        judul: 'Terbaru',
        items: [
          { href: '/', label: 'Berita terbaru' },
          { href: '/cari', label: 'Cari tulisan' },
        ],
      },
    ],
  },
  {
    id: 'karya',
    label: 'Karya Pelajar',
    href: '/karya',
    kolom: [
      {
        judul: 'Jelajahi',
        items: [
          { href: '/karya', label: 'Galeri karya', ket: 'Karya yang sudah terbit' },
        ],
      },
      {
        judul: 'Ikut berkarya',
        items: [
          { href: '/kirim-karya', label: 'Kirim karya', ket: 'Poster, tulisan, dan desain' },
        ],
      },
    ],
  },
  { id: 'tim', label: 'Tim', href: '/tim' },
  {
    id: 'tentang',
    label: 'Tentang',
    href: '/tentang',
    kolom: [
      {
        judul: 'Tentang kami',
        items: [
          { href: '/tentang', label: 'Tentang DutaDamai' },
          { href: '/tim', label: 'Tim redaksi' },
          { href: '/kontak', label: 'Kontak' },
        ],
      },
      {
        judul: 'Aturan',
        items: [
          { href: '/pedoman-komentar', label: 'Pedoman komentar' },
          { href: '/kebijakan-privasi', label: 'Kebijakan privasi' },
        ],
      },
      {
        judul: 'Bantuan',
        items: [
          { href: '/kotak-saran', label: 'Kotak saran' },
          { href: '/lapor', label: 'Lapor konten' },
        ],
      },
    ],
  },
];

function aktif(path: string, href: string) {
  return href === '/' ? path === '/' : path === href || path.startsWith(href + '/');
}

function tanggalHariIni() {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
}

export function NavUtama() {
  const path = usePathname();
  const [buka, setBuka] = useState<string | null>(null);
  const [laci, setLaci] = useState(false);
  const [akordeon, setAkordeon] = useState<string | null>(null);
  const [tanggal, setTanggal] = useState('');
  const [susut, setSusut] = useState(false);
  const tutupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const area = useRef<HTMLDivElement>(null);

  useEffect(() => setTanggal(tanggalHariIni()), []);

  // Header menyusut dan berkaca setelah halaman digulir sedikit.
  useEffect(() => {
    const cek = () => {
      setSusut(window.scrollY > 40);
      if (window.scrollY > 4) setBuka(null);
    };
    cek();
    window.addEventListener('scroll', cek, { passive: true });
    return () => window.removeEventListener('scroll', cek);
  }, []);

  // Tutup semua panel saat pindah halaman.
  useEffect(() => {
    setBuka(null);
    setLaci(false);
  }, [path]);

  // Esc menutup panel; klik di luar menutup panel desktop.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setBuka(null);
        setLaci(false);
      }
    }
    function onKlik(e: MouseEvent) {
      if (area.current && !area.current.contains(e.target as Node)) setBuka(null);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onKlik);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onKlik);
    };
  }, []);

  // Kunci scroll saat laci mobile terbuka.
  useEffect(() => {
    document.body.style.overflow = laci ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [laci]);

  function bukaHover(id: string) {
    if (tutupTimer.current) clearTimeout(tutupTimer.current);
    setBuka(id);
  }
  function tutupHover() {
    if (tutupTimer.current) clearTimeout(tutupTimer.current);
    tutupTimer.current = setTimeout(() => setBuka(null), 140);
  }

  const panel = MENU.find((m) => m.id === buka && m.kolom);

  return (
    <>
      <header className={'site-header' + (susut ? ' susut' : '')}>
        <div className="nav-util wrap">
          <span className="nav-tanggal">{tanggal}</span>
        </div>

        <div className="wrap nav-bar">
          <button
            type="button"
            className={'nav-burger' + (laci ? ' on' : '')}
            aria-expanded={laci}
            aria-controls="laci-mobile"
            aria-label={laci ? 'Tutup menu' : 'Buka menu'}
            onClick={() => setLaci(!laci)}
          >
            <span /><span /><span />
          </button>

          <div className="nav-tengah" ref={area} onMouseLeave={tutupHover} onMouseEnter={() => tutupTimer.current && clearTimeout(tutupTimer.current)}>
            <nav className="nav-baris" aria-label="Menu utama">
              {MENU.map((m) =>
                m.kolom ? (
                  <div key={m.id} className="nav-item" onMouseEnter={() => bukaHover(m.id)}>
                    <Link href={m.href} className={'nav-link' + (aktif(path, m.href) ? ' on' : '')} aria-current={aktif(path, m.href) ? 'page' : undefined}>
                      {m.label}
                    </Link>
                    <button
                      type="button"
                      className="nav-panah"
                      aria-expanded={buka === m.id}
                      aria-controls={`panel-${m.id}`}
                      aria-label={`Buka submenu ${m.label}`}
                      onClick={() => setBuka(buka === m.id ? null : m.id)}
                    >
                      <span aria-hidden>▾</span>
                    </button>
                  </div>
                ) : (
                  <div key={m.id} className="nav-item" onMouseEnter={() => bukaHover('')}>
                    <Link href={m.href} className={'nav-link' + (aktif(path, m.href) ? ' on' : '')} aria-current={aktif(path, m.href) ? 'page' : undefined}>
                      {m.label}
                    </Link>
                  </div>
                ),
              )}
            </nav>

            {panel && panel.kolom && (
              <div className="nav-panel" id={`panel-${panel.id}`} role="region" aria-label={`Submenu ${panel.label}`}>
                <div className="wrap nav-panel-isi" style={{ gridTemplateColumns: `repeat(${panel.kolom.length}, 1fr)` }}>
                  {panel.kolom.map((k) => (
                    <div key={k.judul} className="nav-kol">
                      <p className="kicker">{k.judul}</p>
                      <ul>
                        {k.items.map((it) => (
                          <li key={it.href + it.label}>
                            <Link href={it.href}>{it.label}</Link>
                            {it.ket && <span className="muted">{it.ket}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/" className="brand" aria-label="DutaDamai Sumut, ke beranda">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/logo-dutadamai-sumut.png" alt="" width={128} height={55} className="brand-logo" />
          </Link>

          <div className="nav-aksi">
            <Link href="/cari" className="nav-ikon" aria-label="Cari tulisan" title="Cari">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </Link>
            <Link href="/masuk" className="nav-ikon" aria-label="Masuk tim redaksi" title="Masuk tim">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </Link>
            <ThemeToggle />
            <Link href="/kirim-karya" className="btn nav-cta">Kirim Karya</Link>
          </div>
        </div>
      </header>

      <div id="laci-mobile" className={'nav-laci' + (laci ? ' buka' : '')} aria-hidden={!laci} inert={!laci}>
        <nav aria-label="Menu mobile">
          {MENU.map((m, i) =>
            m.kolom ? (
              <div key={m.id} className="laci-grup" style={{ ['--i' as string]: i }}>
                <button type="button" className="laci-judul" aria-expanded={akordeon === m.id} onClick={() => setAkordeon(akordeon === m.id ? null : m.id)}>
                  {m.label}
                  <span aria-hidden>{akordeon === m.id ? '−' : '+'}</span>
                </button>
                {akordeon === m.id && (
                  <div className="laci-sub">
                    {m.kolom.flatMap((k) => k.items).filter((v, idx, arr) => arr.findIndex((x) => x.href === v.href) === idx).map((it) => (
                      <Link key={it.href} href={it.href}>{it.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={m.id} href={m.href} className="laci-judul laci-tautan" style={{ ['--i' as string]: i }}>
                {m.label}
              </Link>
            ),
          )}
        </nav>
        <div className="laci-bawah">
          <Link href="/kirim-karya" className="btn">Kirim Karya</Link>
        </div>
      </div>
    </>
  );
}
