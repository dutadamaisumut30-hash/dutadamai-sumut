import Link from 'next/link';

export const metadata = { title: 'Pedoman komentar' };

export default function HalamanPedoman() {
  return (
    <section className="narrow">
      <h1>Pedoman komentar</h1>
      <p>Santun, tanpa SARA, tanpa ujaran kebencian, tanpa data pribadi orang lain, dan tanpa promosi. Komentar yang melanggar tidak ditayangkan. Setiap komentar dibaca manusia sebelum tayang, target 24 jam.</p>
      <p><Link href="/lapor" style={{ color: 'var(--accent)' }}>Lapor konten</Link></p>
    </section>
  );
}
