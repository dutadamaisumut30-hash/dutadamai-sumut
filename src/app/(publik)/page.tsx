import Link from 'next/link';
import { RUBRIK, TULISAN } from '@/lib/data-contoh';

export default function Beranda() {
  const [utama, ...lainnya] = TULISAN;
  return (
    <>
      <section className="hero">
        <span className="kicker">Kabar baik dari Sumut</span>
        <h1>{utama.judul}</h1>
        <p className="muted">{utama.ringkasan}</p>
        <Link href={`/berita/${utama.slug}`} className="btn">Baca tulisan</Link>
      </section>

      <section className="sec">
        <h2>Tulisan terbaru</h2>
        <div className="grid3">
          {lainnya.map((t) => (
            <article key={t.slug} className="card">
              <div className={`ph ${t.warna}`} />
              <div className="pad">
                <span className="tagl">{t.rubrik}</span>
                <h3><Link href={`/berita/${t.slug}`}>{t.judul}</Link></h3>
                <p className="muted">{t.menitBaca} menit baca · {t.tanggalTampil}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sec">
        <h2>Rubrik</h2>
        <div className="grid3">
          {RUBRIK.map((r) => (
            <Link key={r.slug} href={`/rubrik/${r.slug}`} className="card pad">
              <h3>{r.nama}</h3>
              <p className="muted">{r.deskripsi}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
