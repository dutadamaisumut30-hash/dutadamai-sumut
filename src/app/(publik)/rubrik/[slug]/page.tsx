import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RUBRIK, cariRubrik, tulisanPerRubrik } from '@/lib/data-contoh';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return RUBRIK.map((r) => ({ slug: r.slug }));
}

export default async function HalamanRubrik({ params }: Props) {
  const { slug } = await params;
  const rubrik = cariRubrik(slug);
  if (!rubrik) notFound();
  const daftar = tulisanPerRubrik(rubrik.nama);

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
