import { wajibAksi } from '@/lib/sesi';
import Link from 'next/link';
import { AdminRedaksi } from '@/components/redaksi/AdminRedaksi';
import '../papan.css';

export const metadata = { title: 'Admin redaksi', robots: { index: false, follow: false } };

export default async function HalamanAdminRedaksi() {
  await wajibAksi('kelola_tim');
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · admin</div>
      <p className="muted"><Link href="/redaksi">← Papan alur redaksi</Link></p>
      <h1>Admin redaksi</h1>
      <p className="muted">Menu: <Link href="/redaksi/tim">Akun tim</Link> · <Link href="/redaksi/rubrik">Rubrik</Link> · <Link href="/redaksi/kotak-saran">Kotak saran</Link> · <Link href="/redaksi/karya-masuk">Karya masuk</Link> · <Link href="/redaksi/komentar">Komentar dan laporan</Link></p>
      <AdminRedaksi />
    </main>
  );
}
