import Link from 'next/link';
import { wajibAksi } from '@/lib/sesi';
import { ambilStatistik } from '@/fitur/statistik';
import { dbTunggal } from '@/lib/db/tunggal';
import { KOLOM } from '@/fitur/tulisan/papan';
import { STATUS_TULISAN } from '@/fitur/tulisan/alur-status';
import { berandaRedaksi } from '@/lib/sesi';
import type { Peran } from '@/lib/izin';
import '../papan.css';

export const metadata = { title: 'Statistik · Redaksi', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function HalamanStatistik() {
  const sesi = await wajibAksi('lihat_statistik');
  const peran = sesi.user.peran as Peran;
  const url = process.env.DATABASE_URL;
  const s = url ? await ambilStatistik(dbTunggal(url), { peran, userId: sesi.user.id }) : null;
  const total = s ? STATUS_TULISAN.reduce((a, k) => a + s.tulisan[k], 0) : 0;
  return (
    <main className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="kicker">Ruang redaksi · statistik</div>
      <p className="muted"><Link href={berandaRedaksi(peran)} className="kembali">← Kembali</Link></p>
      <h1>Statistik</h1>
      <p className="muted">{s?.lingkup === 'milikku' ? 'Ringkasan tulisan milikmu.' : 'Ringkasan seluruh tulisan di redaksi.'} </p>
      <div className="card pad" style={{ marginTop: 12 }}>
        <b>Kunjungan pembaca</b>
        {process.env.NEXT_PUBLIC_UMAMI_DASHBOARD ? (
          <p style={{ margin: '6px 0 0' }}><a className="kembali" href={process.env.NEXT_PUBLIC_UMAMI_DASHBOARD} target="_blank" rel="noopener noreferrer">Buka dasbor Umami ↗</a></p>
        ) : (
          <p className="muted" style={{ margin: '6px 0 0' }}>Umami belum disambungkan. Isi NEXT_PUBLIC_UMAMI_URL, NEXT_PUBLIC_UMAMI_ID, dan NEXT_PUBLIC_UMAMI_DASHBOARD di .env, lalu mulai ulang server. Pelacakan tanpa cookie dan tanpa data pribadi.</p>
        )}
      </div>
      {!s ? <p className="warn">Database belum terhubung.</p> : (
        <>
          <h2 style={{ marginTop: 20 }}>Tulisan per status <span className="muted" style={{ fontSize: 15 }}>({total})</span></h2>
          <div className="stat-grid">
            {STATUS_TULISAN.map((k) => (
              <div key={k} className="card pad stat-ubin">
                <div className="stat-angka">{s.tulisan[k]}</div>
                <div className="tagl">{KOLOM[k].nomor} · {KOLOM[k].judul}</div>
              </div>
            ))}
          </div>
          {s.masuk && (
            <>
              <h2 style={{ marginTop: 28 }}>Kotak masuk redaksi</h2>
              <div className="stat-grid">
                {[
                  ['Komentar menunggu', s.masuk.komentarMenunggu, '/redaksi/komentar'],
                  ['Komentar tampil', s.masuk.komentarTampil, '/redaksi/komentar'],
                  ['Laporan baru', s.masuk.laporanBaru, '/redaksi/laporan'],
                  ['Saran baru', s.masuk.saranBaru, '/redaksi/kotak-saran'],
                  ['Karya antre', s.masuk.karyaAntrean, '/redaksi/karya-masuk'],
                  ['Karya terbit', s.masuk.karyaTerbit, '/redaksi/karya-masuk'],
                ].map(([label, n, href]) => (
                  <Link key={String(label)} href={String(href)} className="card pad stat-ubin stat-tautan">
                    <div className="stat-angka">{n}</div>
                    <div className="tagl">{label}</div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}
