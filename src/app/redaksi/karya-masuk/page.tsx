import Link from 'next/link';
import { KaryaMasuk } from '@/components/redaksi/KaryaMasuk';
import '../papan.css';

export const metadata = { title: 'Karya masuk · Redaksi', robots: { index: false, follow: false } };

export default function HalamanKaryaMasuk() {
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · admin</div>
      <p className="muted"><Link href="/redaksi/admin">← Admin redaksi</Link></p>
      <h1>Karya masuk</h1>
      <p className="muted">Seleksi karya pelajar: nilai, hubungi pengirim, atau kembalikan dengan catatan.</p>
      <KaryaMasuk />
    </main>
  );
}
