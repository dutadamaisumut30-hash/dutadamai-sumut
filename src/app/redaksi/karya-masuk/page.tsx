import { wajibAksi } from '@/lib/sesi';
import Link from 'next/link';
import { KaryaMasuk } from '@/components/redaksi/KaryaMasuk';
import { muatKaryaMasuk } from '@/fitur/karya/actions-seleksi';
import '../papan.css';

export const metadata = { title: 'Karya masuk · Redaksi', robots: { index: false, follow: false } };

export default async function HalamanKaryaMasuk() {
  await wajibAksi('seleksi_karya');
  const awal = await muatKaryaMasuk();
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · seleksi</div>
      <p className="muted"><Link href="/redaksi" className="kembali">← Papan alur redaksi</Link></p>
      <h1>Karya masuk</h1>
      <p className="muted">Seleksi karya pelajar: nilai, hubungi pengirim, atau kembalikan dengan catatan.</p>
      <KaryaMasuk awal={awal} />
    </main>
  );
}
