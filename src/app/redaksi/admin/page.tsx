import Link from 'next/link';
import { AdminRedaksi } from '@/components/redaksi/AdminRedaksi';
import '../papan.css';

export const metadata = { title: 'Admin redaksi', robots: { index: false, follow: false } };

export default function HalamanAdminRedaksi() {
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · admin</div>
      <p className="muted"><Link href="/redaksi">← Papan alur redaksi</Link></p>
      <h1>Admin redaksi</h1>
      <AdminRedaksi />
    </main>
  );
}
