import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TULISAN } from '@/lib/data-contoh';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TULISAN.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = TULISAN.find((x) => x.slug === slug);
  return t ? { title: t.judul, description: t.ringkasan } : { title: 'Tidak ditemukan' };
}

export default async function Berita({ params }: Props) {
  const { slug } = await params;
  const t = TULISAN.find((x) => x.slug === slug);
  if (!t) notFound();

  return (
    <article className="article">
      <span className="tagl">{t.rubrik}</span>
      <h1>{t.judul}</h1>
      <p className="muted">Oleh {t.penulis} · {t.menitBaca} menit baca · {t.tanggalTampil}</p>
      {t.isi.map((paragraf) => (
        <p key={paragraf}>{paragraf}</p>
      ))}
      <p className="muted">Desain: {t.desainer ?? '-'} · Pengembang: {t.developer ?? '-'}</p>
    </article>
  );
}
