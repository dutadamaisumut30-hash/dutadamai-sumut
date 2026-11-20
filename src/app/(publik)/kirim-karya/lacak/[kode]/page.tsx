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
    </section>
  );
}
