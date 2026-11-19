import Link from 'next/link';
import { TugasDkv } from '@/components/redaksi/TugasDkv';
import '../papan.css';

export const metadata = { title: 'Tugas DKV · Redaksi', robots: { index: false, follow: false } };

export default function HalamanTugasDkv() {
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · DKV</div>
      <p className="muted"><Link href="/redaksi">← Papan alur redaksi</Link></p>
      <h1>Tugas desain</h1>
      <p className="muted">Ambil tugas dari daftar, lalu kirim ke Review akhir saat desain selesai.</p>
      <TugasDkv />
    </main>
  );
}
