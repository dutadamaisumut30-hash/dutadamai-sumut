import { LaporForm } from '@/components/publik/LaporForm';

export const metadata = { title: 'Lapor konten' };

export default function HalamanLapor() {
  return (
    <section className="narrow">
      <h1>Lapor konten</h1>
      <p className="muted">Laporanmu masuk antrean moderasi dengan prioritas. Identitasmu tidak diminta dan tidak ditampilkan.</p>
      <LaporForm />
    </section>
  );
}
