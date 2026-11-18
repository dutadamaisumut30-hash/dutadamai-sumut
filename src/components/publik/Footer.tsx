import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap fcols">
        <div style={{ maxWidth: 300 }}>
          DutaDamai Sumut adalah portal berita Duta Damai Sumatera Utara: kabar baik dan karya anak muda Sumut, dari gerakan melawan radikalisme dan terorisme lewat konten positif.
        </div>
        <ul>
          <li><strong>Rubrik</strong></li>
          <li><Link href="/rubrik/cerita-sumut">Cerita Sumut</Link></li>
          <li><Link href="/rubrik/opini-pelajar">Opini Pelajar</Link></li>
          <li><Link href="/rubrik/profil-duta">Profil Duta</Link></li>
          <li><Link href="/rubrik/tips-skill">Tips Skill</Link></li>
          <li><Link href="/rubrik/di-balik-layar">Di Balik Layar</Link></li>
        </ul>
        <ul>
          <li><strong>Website</strong></li>
          <li><Link href="/tentang">Tentang</Link></li>
          <li><Link href="/tim">Tim</Link></li>
          <li><Link href="/karya">Karya Pelajar</Link></li>
          <li><Link href="/kirim-karya">Kirim Karya</Link></li>
        </ul>
        <ul>
          <li><strong>Bantuan</strong></li>
          <li><Link href="/kotak-saran">Kotak Saran</Link></li>
          <li><Link href="/pedoman-komentar">Pedoman komentar</Link></li>
          <li><Link href="/kebijakan-privasi">Kebijakan privasi</Link></li>
          <li><Link href="/lapor">Lapor konten</Link></li>
          <li><Link href="/kontak">Kontak</Link></li>
        </ul>
      </div>
      <div className="wrap" style={{ marginTop: 18 }}>© 2026 Duta Damai Sumatera Utara</div>
    </footer>
  );
}
