import { wajibAksi } from '@/lib/sesi';
import Link from 'next/link';
import { PapanRedaksi } from '@/components/redaksi/PapanRedaksi';
import { muatPapan } from '@/fitur/tulisan/actions';
import './papan.css';

// Halaman internal: tidak diindeks, dan tidak ada tautannya di menu publik.
export const metadata = { title: 'Papan redaksi', robots: { index: false, follow: false } };

export default async function HalamanPapanRedaksi() {
  await wajibAksi('ubah_status_review');
  const awal = await muatPapan();
  const hariIni = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi</div>
      <h1>Papan alur redaksi</h1>
      <p className="muted">
        Lima status tetap. Maju satu langkah per kali: seret kartu ke kolom berikutnya atau pilih status di kartu. Mundur ke status mana pun (termasuk menarik dari Terbit) boleh, dengan catatan wajib.
      </p>
      <PapanRedaksi awal={awal} hariIni={hariIni} />
      <p style={{ marginTop: 24 }}><Link href="/" className="kembali">← Kembali ke beranda</Link></p>
    </main>
  );
}
