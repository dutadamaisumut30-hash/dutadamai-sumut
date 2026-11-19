import Link from 'next/link';

export const metadata = { title: 'Tentang' };

export default function HalamanTentang() {
  return (
    <section>
      <div className="kicker">Tentang kami</div>
      <h1>Melawan kebencian dengan cerita baik</h1>
      <p style={{ fontSize: 18, maxWidth: 720 }}>
        DutaDamai Sumut adalah portal berita Duta Damai Sumatera Utara. Kami menulis, mendesain, dan membangun sendiri ruang untuk kabar baik dan karya anak muda Sumut.
      </p>
      <div className="grid3" style={{ marginTop: 20 }}>
        <div className="card pad"><h3>Menceritakan keberagaman Sumut</h3><p className="muted">Kisah nyata hidup berdampingan, dari kampung sampai sekolah.</p></div>
        <div className="card pad"><h3>Literasi digital yang praktis</h3><p className="muted">Cara mengenali hoaks dan ujaran kebencian sebelum ikut menyebarkannya.</p></div>
        <div className="card pad"><h3>Panggung untuk suara pelajar</h3><p className="muted">Pelajar bisa mengirim tulisan dan desain tanpa akun.</p></div>
      </div>
      <p style={{ marginTop: 20 }}>
        Misi kami: anti radikalisme dan terorisme lewat konten positif. <Link href="/kotak-saran">Kotak Saran</Link> · <Link href="/pedoman-komentar">Pedoman komentar</Link> · <Link href="/kontak">Kontak</Link>
      </p>
      <p className="muted">Profil lengkap Duta Damai Sumut, termasuk sejarah dan pembina, sedang disiapkan bersama pembina.</p>
    </section>
  );
}
