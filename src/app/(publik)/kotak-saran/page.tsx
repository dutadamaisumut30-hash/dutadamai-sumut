import { KotakSaranForm } from '@/components/publik/KotakSaranForm';

export const metadata = { title: 'Kotak Saran' };

export default function HalamanKotakSaran() {
  return (
    <section className="narrow">
      <h1>Kotak Saran</h1>
      <p className="muted">Masukan untuk tulisan, desain, atau website ini. Pesanmu dibaca tim IT dan redaksi.</p>
      <KotakSaranForm />
    </section>
  );
}
