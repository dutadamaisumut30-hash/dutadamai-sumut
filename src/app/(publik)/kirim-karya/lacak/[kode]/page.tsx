import { notFound } from 'next/navigation';
import { ambilStatusLacak } from '@/fitur/karya/lacak';
import { progresKarya } from '@/fitur/karya/alur-seleksi';
import { dbTunggal } from '@/lib/db/tunggal';
import { kodeLacakValid } from '@/lib/kode-lacak';
import { BACKEND_SIAP } from '@/lib/status-sistem';

type Props = { params: Promise<{ kode: string }> };

export default async function Lacak({ params }: Props) {
  const { kode: mentah } = await params;
  if (!kodeLacakValid(mentah)) notFound();
  const kode = mentah.toUpperCase();

  if (!BACKEND_SIAP || !process.env.DATABASE_URL) {
    return (
      <section className="narrow">
        <h1>Lacak karya</h1>
        <p className="muted">Kode lacakmu: <strong>{kode}</strong></p>
        <div className="warn">Pelacakan belum tersambung ke server, jadi kode ini belum bisa dicek.</div>
      </section>
    );
  }

  const status = await ambilStatusLacak(dbTunggal(process.env.DATABASE_URL), kode);
  if (!status) notFound();

  return (
    <section className="narrow">
      <h1>Lacak karya</h1>
      <p className="muted">Kode lacakmu: <strong>{kode}</strong></p>
      <p><b>{status.judul}</b> · {status.jenis}</p>
      <ol className="track">
        {progresKarya(status.tahap).map((l) => (
          <li key={l.id} className={l.status}>
            <b>{l.id}. {l.label}</b>
          </li>
        ))}
      </ol>
      {status.tahap === 'dikembalikan' && (
        <div className="warn" role="status">
          <b>Karyamu dikembalikan untuk diperbaiki.</b>
          {status.catatan && <p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>Catatan redaksi: {status.catatan}</p>}
          <p style={{ margin: '6px 0 0' }}>
            Perbaiki sesuai catatan. Redaksi menandai karyamu sebagai revisi masuk setelah perbaikannya diterima.
            Kontakmu dihapus jika 30 hari tidak ada respons.
          </p>
        </div>
      )}
    </section>
  );
}
