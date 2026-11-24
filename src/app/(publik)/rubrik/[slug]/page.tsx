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
            <div className={'baris-tulisan' + (t.sampul ? '' : ' tanpa-gambar')}>
              {t.sampul && (
                <Link href={`/berita/${t.slug}`} className="baris-thumb" aria-hidden tabIndex={-1}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/sampul/${t.slug}`} alt="" loading="lazy" />
                </Link>
              )}
              <div>
                <h3 style={{ margin: 0 }}><Link href={`/berita/${t.slug}`}>{t.judul}</Link></h3>
                <p className="muted" style={{ margin: '6px 0 0' }}>{t.ringkasan}</p>
              </div>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
