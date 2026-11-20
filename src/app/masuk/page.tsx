import { FormMasuk } from '@/components/akun/FormMasuk';

export const metadata = { title: 'Masuk tim', robots: { index: false, follow: false } };

export default function HalamanMasuk() {
  return (
    <main className="halaman-tengah">
      <div className="kicker">Ruang tim</div>
      <h1>Masuk</h1>
      <p className="muted">Khusus anggota tim redaksi. Akun dibuat oleh Admin.</p>
      <FormMasuk />
    </main>
  );
}
