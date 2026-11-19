import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DetailTulisan } from '@/components/redaksi/DetailTulisan';
import { ITEM_PAPAN_CONTOH } from '@/lib/papan-contoh';
import '../../papan.css';

export const metadata = { title: 'Detail tulisan · Redaksi', robots: { index: false, follow: false } };

export default async function HalamanDetailTulisan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = ITEM_PAPAN_CONTOH.find((i) => i.id === id);
  if (!item) notFound();

  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · pratinjau</div>
      <p className="muted"><Link href="/redaksi">← Papan alur redaksi</Link></p>
      <div className="warn" style={{ marginBottom: 14 }}>
        Pratinjau tanpa login. Perubahan di halaman ini belum tersimpan ke papan.
      </div>
      <DetailTulisan awal={item} />
    </main>
  );
}
