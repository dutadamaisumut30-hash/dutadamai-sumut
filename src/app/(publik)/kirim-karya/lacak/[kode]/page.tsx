import { notFound } from 'next/navigation';
import { daftarLangkah } from '@/fitur/karya/alur-seleksi';
import { kodeLacakValid } from '@/lib/kode-lacak';
import { BACKEND_SIAP } from '@/lib/status-sistem';

type Props = { params: Promise<{ kode: string }> };

export default async function Lacak({ params }: Props) {
  const { kode: mentah } = await params;
  if (!kodeLacakValid(mentah)) notFound();
  const kode = mentah.toUpperCase();

  // TODO(database): ambil tahap karya dari tabel `karya` berdasarkan kode, lalu pakai progresKarya(tahap).
  // Sampai itu, halaman tidak menandai langkah apa pun sebagai selesai: tidak ada data yang bisa dipercaya.
  return (
    <section className="narrow">
      <h1>Lacak karya</h1>
      <p className="muted">Kode lacakmu: <strong>{kode}</strong></p>
      {BACKEND_SIAP ? (
        <p className="muted">Tahap terkini akan tampil di sini setelah pelacakan tersambung.</p>
      ) : (
        <div className="warn">Pelacakan belum tersambung ke server, jadi kode ini belum bisa dicek. Karyamu belum tersimpan sampai layanan ini aktif.</div>
      )}
      <ol className="track">
        {daftarLangkah().map((l) => (
          <li key={l.id}>
            <b>{l.id}. {l.label}</b>
          </li>
        ))}
      </ol>
    </section>
  );
}
