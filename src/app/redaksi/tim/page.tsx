import { wajibAksi } from '@/lib/sesi';
import Link from 'next/link';
import { AkunTim } from '@/components/redaksi/AkunTim';
import { muatAnggota } from '@/fitur/tim/actions';
import '../papan.css';

export const metadata = { title: 'Akun tim · Redaksi', robots: { index: false, follow: false } };

export default async function HalamanAkunTim() {
  await wajibAksi('kelola_tim');
  const awal = await muatAnggota();
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · admin</div>
      <p className="muted"><Link href="/redaksi/admin" className="kembali">← Admin redaksi</Link></p>
      <h1>Akun tim</h1>
      <p className="muted">Atur anggota dan tampilannya di halaman Tim. Nama yang belum dikonfirmasi bisa disembunyikan.</p>
      <AkunTim awal={awal} />
    </main>
  );
}
