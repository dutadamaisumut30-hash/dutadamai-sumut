import { CariClient } from '@/components/publik/CariClient';
import { ambilRubrik } from '@/fitur/rubrik/layanan';
import { ambilTulisanTerbit } from '@/fitur/publik/layanan';
import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';

export const metadata = { title: 'Cari' };
export const dynamic = 'force-dynamic';

export default async function HalamanCari() {
  const db = dbTunggal(urlDbWajib());
  const [tulisan, rubrik] = await Promise.all([ambilTulisanTerbit(db), ambilRubrik(db)]);
  return <CariClient tulisan={tulisan} rubrik={rubrik} />;
}
