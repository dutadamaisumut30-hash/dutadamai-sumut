import { wajibAksi } from '@/lib/sesi';
import Link from 'next/link';
import { KelolaRubrik } from '@/components/redaksi/KelolaRubrik';
import '../papan.css';

export const metadata = { title: 'Kelola rubrik · Redaksi', robots: { index: false, follow: false } };

export default async function HalamanKelolaRubrik() {
  await wajibAksi('kelola_rubrik');
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · rubrik</div>
      <p className="muted"><Link href="/redaksi">← Papan alur redaksi</Link></p>
      <h1>Kelola rubrik</h1>
      <p className="muted">Lima rubrik tetap. Yang bisa diubah di sini adalah deskripsinya.</p>
      <KelolaRubrik />
    </main>
  );
}
