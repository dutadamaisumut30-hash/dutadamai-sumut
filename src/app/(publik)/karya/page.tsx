import { KARYA } from '@/lib/data-contoh';
import { KaryaGrid } from '@/components/publik/KaryaGrid';

export const metadata = { title: 'Karya Pelajar' };

export default function HalamanKarya() {
  return (
    <section>
      <h1>Karya Pelajar</h1>
      <p className="muted">Tulisan dan desain anak muda Sumut yang sudah lolos seleksi redaksi.</p>
      <KaryaGrid karya={KARYA} />
    </section>
  );
}
