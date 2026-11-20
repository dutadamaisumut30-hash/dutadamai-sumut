import { wajibAksi } from '@/lib/sesi';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DetailTulisan } from '@/components/redaksi/DetailTulisan';
import { muatTulisan } from '@/fitur/tulisan/actions';
import { ambilBerkasTulisan } from '@/fitur/berkas/layanan';
import { dbTunggal } from '@/lib/db/tunggal';
import { bolehAksi, type Peran } from '@/lib/izin';
import '../../papan.css';

export const metadata = { title: 'Detail tulisan · Redaksi', robots: { index: false, follow: false } };

export default async function HalamanDetailTulisan({ params }: { params: Promise<{ id: string }> }) {
  const sesi = await wajibAksi('unggah_desain');
  const peran = sesi.user.peran as Peran;
  const { id } = await params;
  const item = await muatTulisan(id);
  if (!item) notFound();
  const url = process.env.DATABASE_URL;
  const berkas = url ? await ambilBerkasTulisan(dbTunggal(url), id) : [];
  const hariIni = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi</div>
      <p className="muted"><Link href="/redaksi">← Papan alur redaksi</Link></p>
      <DetailTulisan
        awal={item}
        hariIni={hariIni}
        bisaReview={bolehAksi(peran, 'ubah_status_review')}
        berkas={berkas}
      />
    </main>
  );
}
