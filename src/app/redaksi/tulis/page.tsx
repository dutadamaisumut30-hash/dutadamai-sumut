import Link from 'next/link';
import { wajibAksi } from '@/lib/sesi';
import { TulisSaya } from '@/components/redaksi/TulisSaya';
import { muatTulisanSaya } from '@/fitur/tulis/actions';
import '../papan.css';

export const metadata = { title: 'Tulisanku · Redaksi', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function HalamanTulis() {
  await wajibAksi('tulis_draf');
  const { tulisan, rubrik } = await muatTulisanSaya();
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang tim · penulis</div>
      <p className="muted"><Link href="/akun/keamanan" className="kembali">← Akun</Link></p>
      <h1>Tulisanku</h1>
      <p className="muted">Tulis draf, simpan, lalu ajukan ke desain. Setelah diajukan, DKV dan editor yang melanjutkan.</p>
      <TulisSaya rubrik={rubrik} awal={tulisan} />
    </main>
  );
}
