import { wajibAksi } from '@/lib/sesi';
import Link from 'next/link';
import { ModerasiKomentar } from '@/components/redaksi/ModerasiKomentar';
import { muatKomentar } from '@/fitur/komentar/actions';
import '../papan.css';

export const metadata = { title: 'Komentar dan laporan · Redaksi', robots: { index: false, follow: false } };

export default async function HalamanKomentar() {
  await wajibAksi('moderasi');
  const awal = await muatKomentar();
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · moderasi</div>
      <p className="muted"><Link href="/redaksi/admin">← Admin redaksi</Link></p>
      <h1>Komentar dan laporan</h1>
      <p className="muted">Komentar dengan laporan terbanyak tampil paling atas. <Link href="/redaksi/laporan">Lihat laporan konten dari pengunjung →</Link></p>
      <ModerasiKomentar awal={awal} />
    </main>
  );
}
