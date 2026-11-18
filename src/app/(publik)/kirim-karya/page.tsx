import { KirimForm } from '@/components/publik/KirimForm';

export const metadata = { title: 'Kirim Karya' };

export default function HalamanKirim() {
  return (
    <section>
      <h1>Kirim Karya</h1>
      <p className="muted">Tiga langkah singkat. Setelah kirim, kamu dapat kode lacak untuk memantau proses seleksi tanpa perlu akun.</p>
      <KirimForm />
    </section>
  );
}
