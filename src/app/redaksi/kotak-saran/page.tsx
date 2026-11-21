import { wajibAksi } from '@/lib/sesi';
import Link from 'next/link';
import { ModerasiSaran } from '@/components/redaksi/ModerasiSaran';
import { muatSaranMasuk } from '@/fitur/saran/actions-moderasi';
import '../papan.css';

export const metadata = { title: 'Kotak saran · Redaksi', robots: { index: false, follow: false } };

export const dynamic = 'force-dynamic';

export default async function HalamanKotakSaran() {
  await wajibAksi('baca_kotak_saran');
  const awal = await muatSaranMasuk();
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · moderasi</div>
      <p className="muted"><Link href="/redaksi">← Papan alur redaksi</Link></p>
      <h1>Kotak saran</h1>
      <p className="muted">Saran dari publik. Tandai dibaca, lalu tindak lanjuti atau arsipkan.</p>
      <ModerasiSaran awal={awal} />
    </main>
  );
}
