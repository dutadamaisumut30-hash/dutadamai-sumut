import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ambilRubrik } from '@/fitur/rubrik/layanan';
import { ambilTulisanTerbit } from '@/fitur/publik/layanan';
import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';

type Props = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

export default async function HalamanRubrik({ params }: Props) {
  const { slug } = await params;
  const db = dbTunggal(urlDbWajib());
  const rubrik = (await ambilRubrik(db)).find((r) => r.slug === slug);
  if (!rubrik) notFound();
  const daftar = await ambilTulisanTerbit(db, slug);

  return (
    <section>
      <h1>{rubrik.nama}</h1>
      <p className="muted">{rubrik.deskripsi}</p>
      {daftar.length === 0 ? (
        <p className="muted">Belum ada tulisan di rubrik ini.</p>
      ) : (
        daftar.map((t) => (
          <article key={t.slug} className="card pad" style={{ marginTop: 12 }}>
            <h3><Link href={`/berita/${t.slug}`}>{t.judul}</Link></h3>
            <p className="muted">{t.ringkasan}</p>
          </article>
        ))
      )}
    </section>
  );
}
