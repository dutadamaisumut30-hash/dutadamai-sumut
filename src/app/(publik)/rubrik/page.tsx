import Link from 'next/link';
import { ambilRubrik } from '@/fitur/rubrik/layanan';
import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';

export const metadata = { title: 'Rubrik' };
export const dynamic = 'force-dynamic';

export default async function HalamanRubrikIndeks() {
  const daftar = await ambilRubrik(dbTunggal(urlDbWajib()));
  return (
    <section>
      <div className="kicker">Rubrik tetap</div>
      <h1>Lima rubrik, satu redaksi</h1>
      <p className="muted">Setiap rubrik punya ciri sendiri dan tetap terlihat di menu.</p>
      <div className="grid3" style={{ marginTop: 20 }}>
        {daftar.map((r) => (
          <Link key={r.slug} href={`/rubrik/${r.slug}`} className="card pad" style={{ textDecoration: 'none' }}>
            <h3>{r.nama}</h3>
            <p className="muted">{r.deskripsi}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
