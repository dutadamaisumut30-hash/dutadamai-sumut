import Link from 'next/link';

const MENU = [
  { href: '/redaksi/tim', judul: 'Akun tim', ket: 'Anggota, peran, dan siapa yang tampil di halaman Tim.', kode: 'AT' },
  { href: '/redaksi', judul: 'Papan alur', ket: 'Lima status tulisan dari draf sampai terbit.', kode: 'PA' },
  { href: '/redaksi/karya-masuk', judul: 'Karya masuk', ket: 'Seleksi karya pelajar dan keputusan akhirnya.', kode: 'KM' },
  { href: '/redaksi/komentar', judul: 'Komentar', ket: 'Moderasi komentar yang menunggu.', kode: 'KO' },
  { href: '/redaksi/laporan', judul: 'Laporan konten', ket: 'Laporan dari pembaca yang perlu ditangani.', kode: 'LA' },
  { href: '/redaksi/kotak-saran', judul: 'Kotak saran', ket: 'Saran pembaca, tanpa data kontak.', kode: 'KS' },
  { href: '/redaksi/rubrik', judul: 'Rubrik', ket: 'Kelola nama dan deskripsi rubrik.', kode: 'RU' },
  { href: '/redaksi/dkv', judul: 'Tampilan DKV', ket: 'Antrean tugas desain dan unggah berkas.', kode: 'DK' },
  { href: '/redaksi/tulis', judul: 'Tulisanku', ket: 'Draf tulisan milikmu sendiri.', kode: 'TU' },
];

// Pintasan ke semua ruang kerja. Gerak masuk dan hover murni CSS (lihat papan.css).
export function MenuAdmin() {
  return (
    <nav aria-label="Menu admin" className="ubin-grid">
      {MENU.map((m, i) => (
        <Link key={m.href} href={m.href} className="ubin" style={{ ['--i' as string]: i }}>
          <span className="ubin-kode" aria-hidden="true">{m.kode}</span>
          <span className="ubin-isi">
            <b>{m.judul}</b>
            <span className="muted">{m.ket}</span>
          </span>
          <span className="ubin-panah" aria-hidden="true">→</span>
        </Link>
      ))}
    </nav>
  );
}
