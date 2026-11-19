import { BACKEND_SIAP } from '@/lib/status-sistem';

export const metadata = { title: 'Lapor konten' };

export default function HalamanLapor() {
  const nonaktif = !BACKEND_SIAP;
  return (
    <section className="narrow">
      <h1>Lapor konten</h1>
      <p className="muted">Laporanmu masuk antrean moderasi dengan prioritas. Identitasmu tidak ditampilkan.</p>
      {nonaktif && <div className="warn">Laporan belum bisa dikirim dari halaman ini. Pelaporan sedang disiapkan.</div>}
      <label htmlFor="lr">Alasan</label>
      <select id="lr" disabled={nonaktif}>
        <option>Ujaran kebencian atau SARA</option>
        <option>Data pribadi orang lain</option>
        <option>Promosi atau spam</option>
        <option>Lainnya</option>
      </select>
      <label htmlFor="lc">Catatan (opsional)</label>
      <textarea id="lc" rows={4} disabled={nonaktif} />
      <button type="button" className="btn" disabled={nonaktif}>Kirim laporan</button>
    </section>
  );
}
