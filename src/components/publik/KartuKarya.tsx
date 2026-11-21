import type { KaryaContoh } from '@/lib/data-contoh';

export function KartuKarya({ k }: { k: KaryaContoh }) {
  if (k.jenis === 'tulisan') {
    return (
      <article className="card">
        <div className="pad qcard">
          <span className="tagl">Tulisan</span>
          <p className="quote">“{k.kutipan ?? k.judul}”</p>
          <p className="muted">{k.judul} · {k.oleh}</p>
        </div>
      </article>
    );
  }
  return (
    <article className="card">
      {k.gambar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={k.gambar} alt={`Desain: ${k.judul}`} loading="lazy" style={{ width: '100%', display: 'block', aspectRatio: '4 / 3', objectFit: 'cover' }} />
      ) : (
        <div className={`ph ${k.warna}`}>
          <b>Desain</b>
        </div>
      )}
      <div className="pad">
        <h3>{k.judul}</h3>
        <p className="muted">oleh {k.oleh}</p>
      </div>
    </article>
  );
}
