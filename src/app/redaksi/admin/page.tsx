import { wajibAksi } from '@/lib/sesi';
import Link from 'next/link';
import { AdminRedaksi } from '@/components/redaksi/AdminRedaksi';
import { MenuAdmin } from '@/components/redaksi/MenuAdmin';
import { muatPapan } from '@/fitur/tulisan/actions';
import { STATUS_TULISAN, type StatusTulisan } from '@/fitur/tulisan/alur-status';
import '../papan.css';

export const metadata = { title: 'Admin redaksi', robots: { index: false, follow: false } };

export default async function HalamanAdminRedaksi() {
  await wajibAksi('kelola_tim');
  const papan = await muatPapan();
  const jumlah = Object.fromEntries(
    STATUS_TULISAN.map((st) => [st, papan.filter((i) => i.status === st).length]),
  ) as Record<StatusTulisan, number>;
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · admin</div>
      <p className="muted"><Link href="/redaksi" className="kembali">← Papan alur redaksi</Link></p>
      <h1>Admin redaksi</h1>
      <p className="muted">Pintasan ke semua ruang kerja redaksi.</p>
      <MenuAdmin />
      <AdminRedaksi jumlah={jumlah} />
    </main>
  );
}
