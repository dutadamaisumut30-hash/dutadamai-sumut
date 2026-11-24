import Link from 'next/link';
import { wajibAksi } from '@/lib/sesi';
import { ModerasiLaporan } from '@/components/redaksi/ModerasiLaporan';
import { muatLaporan } from '@/fitur/laporan/actions';
import '../papan.css';

export const metadata = { title: 'Laporan konten · Redaksi', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function HalamanLaporan() {
  await wajibAksi('moderasi');
  const awal = await muatLaporan();
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · moderasi</div>
      <p className="muted"><Link href="/redaksi/komentar" className="kembali">← Komentar dan laporan</Link></p>
      <h1>Laporan konten</h1>
      <p className="muted">Laporan dari pengunjung lewat halaman Lapor konten. Laporan baru tampil paling atas.</p>
      <ModerasiLaporan awal={awal} />
    </main>
  );
}
