import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="narrow" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div className="kicker">Error 404</div>
      <h1>Halaman ini tersesat</h1>
      <p className="muted">Satu lingkaran kami hilang dari tempatnya. Mungkin tautannya salah ketik, atau tulisannya sudah dipindah.</p>
      <Link className="btn" href="/">Yuk kembali ke beranda</Link>
      <p style={{ marginTop: 14 }}><Link href="/cari" style={{ color: 'var(--accent)' }}>Atau cari tulisan</Link></p>
    </main>
  );
}
