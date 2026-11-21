import Link from 'next/link';
import { wajibAksi } from '@/lib/sesi';
import { TugasDkv } from '@/components/redaksi/TugasDkv';
import { muatPapan } from '@/fitur/tulisan/actions';
import '../papan.css';

export const metadata = { title: 'Tugas DKV · Redaksi', robots: { index: false, follow: false } };

export default async function HalamanTugasDkv() {
  await wajibAksi('unggah_desain');
  const awal = await muatPapan();
  const hariIni = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · DKV</div>
      <p className="muted"><Link href="/redaksi">← Papan alur redaksi</Link></p>
      <h1>Tugas desain</h1>
      <p className="muted">Ambil tugas dari daftar, lalu kirim ke Review akhir saat desain selesai.</p>
      <TugasDkv awal={awal} hariIni={hariIni} />
    </main>
  );
}
