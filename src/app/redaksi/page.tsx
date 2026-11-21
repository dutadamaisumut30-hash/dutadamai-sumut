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
        Lima status tetap, tidak boleh dilompati. Seret kartu ke kolom berikutnya, atau pilih status dari daftar di kartu. Mundur hanya dari Review akhir, dengan catatan wajib.
      </p>
      <p><Link href="/redaksi/dkv">Tampilan DKV →</Link> · <Link href="/redaksi/kotak-saran">Kotak saran →</Link> · <Link href="/redaksi/laporan">Laporan konten →</Link> · <Link href="/redaksi/tulis">Tulisanku →</Link> · <Link href="/redaksi/admin">Admin →</Link> · <Link href="/redaksi/rubrik">Rubrik →</Link></p>
      <PapanRedaksi awal={awal} hariIni={hariIni} />
      <p style={{ marginTop: 24 }}><Link href="/">Kembali ke beranda</Link></p>
    </main>
  );
}
