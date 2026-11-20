import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BagikanTulisan } from '@/components/publik/BagikanTulisan';
import { KomentarForm } from '@/components/publik/KomentarForm';
import { ambilKomentarTampil, ambilTerbit } from '@/fitur/komentar/layanan';
import { dbTunggal } from '@/lib/db/tunggal';

type Props = { params: Promise<{ slug: string }> };

async function muat(slug: string) {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const db = dbTunggal(url);
  const tulisan = await ambilTerbit(db, slug);
  if (!tulisan) return null;
  const komentar = await ambilKomentarTampil(db, tulisan.id);
  return { tulisan, komentar };
}

// Kartu bagikan: judul dan ringkasan ini dipakai saat tautan dibagikan di media sosial.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await muat(slug);
  if (!data) return { title: 'Tulisan tidak ditemukan' };
  const deskripsi = data.tulisan.isi.slice(0, 160) || data.tulisan.judul;
  return {
    title: data.tulisan.judul,
    description: deskripsi,
    openGraph: { title: data.tulisan.judul, description: deskripsi, type: 'article' },
  };
}

export default async function HalamanBerita({ params }: Props) {
  const { slug } = await params;
  const data = await muat(slug);
  if (!data) notFound();
  const { tulisan, komentar } = data;

  return (
    <section style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="tagl">{tulisan.rubrik}</div>
      <h1>{tulisan.judul}</h1>
      <p className="muted">Penanggung: {tulisan.penanggung.join(', ')}</p>

      <article className="isi-tulisan" style={{ marginTop: 20 }}>
        {tulisan.isi.split(/\n\s*\n/).map((paragraf, i) => (
          <p key={i}>{paragraf}</p>
        ))}
      </article>

      <BagikanTulisan judul={tulisan.judul} />

      <section style={{ marginTop: 40 }}>
        <h2>Komentar</h2>
        {komentar.length === 0 ? (
          <p className="muted">Belum ada komentar.</p>
        ) : (
          komentar.map((k) => (
            <div key={k.id} className="card pad" style={{ marginTop: 12 }}>
              <strong>{k.nama}</strong>
              <p style={{ margin: '6px 0 0' }}>{k.isi}</p>
            </div>
          ))
        )}
        <KomentarForm tulisanId={tulisan.id} />
      </section>
    </section>
  );
}
