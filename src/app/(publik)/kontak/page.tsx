import Link from 'next/link';

export const metadata = { title: 'Kontak' };

export default function HalamanKontak() {
  return (
    <section className="narrow">
      <h1>Kontak</h1>
      <p>Cara paling cepat: <Link href="/kotak-saran" style={{ color: 'var(--accent)' }}>kirim lewat Kotak Saran</Link>.</p>
      <p className="muted">Email redaksi sedang disiapkan.</p>
    </section>
  );
}
