import { notFound } from 'next/navigation';
import { kodeLacakValid } from '@/lib/kode-lacak';

const TAHAP = [
  'Formulir terkirim',
  'Cek otomatis',
  'Antrean redaksi',
  'Layak terbit?',
  'Dihubungi atau dikembalikan dengan catatan',
  'Terbit di rubrik Karya Pelajar',
];

type Props = { params: Promise<{ kode: string }> };

export default async function Lacak({ params }: Props) {
  const { kode } = await params;
  if (!kodeLacakValid(kode)) notFound();

  return (
    <section className="narrow">
      <h1>Lacak karya</h1>
      <p className="muted">Kode lacakmu: <strong>{kode}</strong></p>
      <p className="muted">Status belum tersambung ke database. Halaman ini akan menampilkan tahap terkini setelah backend siap.</p>
      <ol className="track">
        {TAHAP.map((t, i) => (
          <li key={t} className={i === 0 ? 'selesai' : ''}>{t}</li>
        ))}
      </ol>
    </section>
  );
}
