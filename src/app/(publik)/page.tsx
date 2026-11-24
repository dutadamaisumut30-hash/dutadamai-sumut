import Link from 'next/link';
import { ambilRubrik } from '@/fitur/rubrik/layanan';
import { ambilTulisanTerbit } from '@/fitur/publik/layanan';
import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';

export const dynamic = 'force-dynamic';

export default async function Beranda() {
  const db = dbTunggal(urlDbWajib());
  const [tulisan, rubrik] = await Promise.all([ambilTulisanTerbit(db), ambilRubrik(db)]);
  const [utama, ...lainnya] = tulisan;

  return (
    <>
      {utama ? (
        <section className="hero">
          <div>
            <span className="kicker">Kabar baik dari Sumut</span>
            <h1>{utama.judul}</h1>
            <p className="muted">{utama.ringkasan}</p>
            <Link href={`/berita/${utama.slug}`} className="btn">Baca tulisan</Link>
          </div>
          {utama.sampul ? (
            <Link href={`/berita/${utama.slug}`} className="card ph hero-sampul" aria-label={`Baca: ${utama.judul}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/sampul/${utama.slug}`} alt={`Sampul tulisan: ${utama.judul}`} />
            </Link>
          ) : (
            <div className="card ph ph-warm" aria-hidden="true">
              <div className="ring" />
              <b>Foto · DKV</b>
            </div>
          )}
        </section>
      ) : (
        <section>
          <p className="muted">Belum ada tulisan yang terbit.</p>
        </section>
      )}

      {lainnya.length > 0 && (
        <section>
          <div className="sec"><h2>Tulisan terbaru</h2></div>
          <div className="grid3">
            {lainnya.slice(0, 6).map((t) => (
              <article key={t.slug} className="card">
                {t.sampul ? (
                  <Link href={`/berita/${t.slug}`} className="ph" aria-label={`Baca: ${t.judul}`} tabIndex={-1}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/sampul/${t.slug}`} alt="" loading="lazy" />
                  </Link>
                ) : (
                  <div className={`ph ${t.warna}`} />
                )}
                <div className="pad">
                  <span className="tagl">{t.rubrik}</span>
                  <h3><Link href={`/berita/${t.slug}`}>{t.judul}</Link></h3>
                  <p className="muted">{t.menitBaca} menit baca · {t.tanggalTampil}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="sec"><h2>Rubrik</h2></div>
        <div className="grid3">
          {rubrik.map((r) => (
            <Link key={r.slug} href={`/rubrik/${r.slug}`} className="card pad" style={{ textDecoration: 'none' }}>
              <h3>{r.nama}</h3>
              <p className="muted">{r.deskripsi}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
