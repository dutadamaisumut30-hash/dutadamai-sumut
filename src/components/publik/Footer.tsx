import Link from 'next/link';

const RUBRIK = [
  { href: '/rubrik/cerita-sumut', label: 'Cerita Sumut' },
  { href: '/rubrik/opini-pelajar', label: 'Opini Pelajar' },
  { href: '/rubrik/profil-duta', label: 'Profil Duta' },
  { href: '/rubrik/tips-skill', label: 'Tips Skill' },
  { href: '/rubrik/di-balik-layar', label: 'Di Balik Layar' },
];

const WEBSITE = [
  { href: '/tentang', label: 'Tentang' },
  { href: '/tim', label: 'Tim' },
  { href: '/karya', label: 'Karya Pelajar' },
  { href: '/kirim-karya', label: 'Kirim Karya' },
];

const BANTUAN = [
  { href: '/kotak-saran', label: 'Kotak Saran' },
  { href: '/pedoman-komentar', label: 'Pedoman komentar' },
  { href: '/kebijakan-privasi', label: 'Kebijakan privasi' },
  { href: '/lapor', label: 'Lapor konten' },
  { href: '/kontak', label: 'Kontak' },
  { href: '/masuk', label: 'Masuk tim' },
];

function Kolom({ judul, items }: { judul: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="fjudul">{judul}</p>
      <ul className="flist">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap fkisi">
        <div className="fmerek">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/logo-dutadamai-sumut.png" alt="DutaDamai Sumut" width={128} height={55} className="flogo" />
          <p>
            DutaDamai Sumut adalah portal berita Duta Damai Sumatera Utara: kabar baik dan karya anak muda Sumut, dari gerakan melawan radikalisme dan terorisme lewat konten positif.
          </p>
        </div>
        <Kolom judul="Rubrik" items={RUBRIK} />
        <Kolom judul="Website" items={WEBSITE} />
        <Kolom judul="Bantuan" items={BANTUAN} />
      </div>
      <div className="wrap fbawah">
        <p>© 2026 Duta Damai Sumatera Utara</p>
        <nav aria-label="Tautan hukum">
          <Link href="/kebijakan-privasi">Kebijakan privasi</Link>
          <Link href="/kontak">Kontak</Link>
        </nav>
      </div>
    </footer>
  );
}
