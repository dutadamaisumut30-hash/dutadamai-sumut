import { ambilKaryaTerbit } from '@/fitur/publik/layanan';
import { KaryaGrid } from '@/components/publik/KaryaGrid';
import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';

export const metadata = { title: 'Karya Pelajar' };
export const dynamic = 'force-dynamic';

export default async function HalamanKarya() {
  const karya = await ambilKaryaTerbit(dbTunggal(urlDbWajib()));
  return (
    <section>
      <h1>Karya Pelajar</h1>
      <p className="muted">Tulisan dan desain anak muda Sumut yang sudah lolos seleksi redaksi.</p>
      <KaryaGrid karya={karya} />
    </section>
  );
}
