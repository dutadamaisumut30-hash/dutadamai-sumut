import Link from 'next/link';
import { RUBRIK } from '@/lib/data-contoh';

export const metadata = { title: 'Rubrik' };

export default function HalamanRubrikIndeks() {
  return (
    <section>
      <div className="kicker">Rubrik tetap</div>
      <h1>Lima rubrik, satu redaksi</h1>
      <p className="muted">Setiap rubrik punya ciri sendiri dan tetap terlihat di menu.</p>
      <div className="grid3" style={{ marginTop: 20 }}>
        {RUBRIK.map((r) => (
          <Link key={r.slug} href={`/rubrik/${r.slug}`} className="card pad" style={{ textDecoration: 'none' }}>
            <h3>{r.nama}</h3>
            <p className="muted">{r.deskripsi}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
