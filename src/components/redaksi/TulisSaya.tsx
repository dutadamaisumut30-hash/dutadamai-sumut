'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ajukanDrafAksi, buatDrafAksi, simpanDrafAksi } from '@/fitur/tulis/actions';
import type { TulisanSaya } from '@/fitur/tulis/layanan';
import { KOLOM } from '@/fitur/tulisan/papan';

type Rubrik = { slug: string; nama: string };

interface Isian { judul: string; rubrikSlug: string; isi: string }

function FormDraf({
  rubrik, awal, id, sudahAjukan,
}: { rubrik: Rubrik[]; awal: Isian; id?: string; sudahAjukan?: boolean }) {
  const router = useRouter();
  const [f, setF] = useState<Isian>(awal);
  const [pesan, setPesan] = useState('');
  const [galat, setGalat] = useState(false);
  const [sibuk, mulai] = useTransition();
  const baru = !id;

  function selesai(ok: boolean, teks: string) {
    setGalat(!ok);
    setPesan(teks);
    if (ok) router.refresh();
  }

  function simpan() {
    mulai(async () => {
      if (baru) {
        const h = await buatDrafAksi(f);
        if (h.ok) setF({ judul: '', rubrikSlug: f.rubrikSlug, isi: '' });
        return selesai(h.ok, h.ok ? 'Draf tersimpan.' : h.pesan);
      }
      const h = await simpanDrafAksi(id, f);
      selesai(h.ok, h.ok ? 'Perubahan tersimpan.' : h.pesan);
    });
  }

  function ajukan() {
    if (!id) return;
    mulai(async () => {
      const s = await simpanDrafAksi(id, f);
      if (!s.ok) return selesai(false, s.pesan);
      const h = await ajukanDrafAksi(id);
      selesai(h.ok, h.ok ? 'Diajukan ke desain.' : h.pesan);
    });
  }

  const idf = id ?? 'baru';
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label htmlFor={`j-${idf}`}>Judul</label>
      <input id={`j-${idf}`} value={f.judul} onChange={(e) => setF({ ...f, judul: e.target.value })} />
      <label htmlFor={`r-${idf}`}>Rubrik</label>
      <select id={`r-${idf}`} value={f.rubrikSlug} onChange={(e) => setF({ ...f, rubrikSlug: e.target.value })}>
        {rubrik.map((r) => <option key={r.slug} value={r.slug}>{r.nama}</option>)}
      </select>
      <label htmlFor={`i-${idf}`}>Isi (pisahkan paragraf dengan baris kosong)</label>
      <textarea id={`i-${idf}`} rows={8} value={f.isi} onChange={(e) => setF({ ...f, isi: e.target.value })} />
      {pesan && <div className={galat ? 'warn' : 'ok'} role="status">{pesan}</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-ghost" disabled={sibuk} onClick={simpan}>
          {baru ? 'Simpan sebagai draf' : 'Simpan perubahan'}
        </button>
        {!baru && !sudahAjukan && (
          <button type="button" className="btn" disabled={sibuk} onClick={ajukan}>Ajukan ke desain</button>
        )}
      </div>
    </div>
  );
}

export function TulisSaya({ rubrik, awal }: { rubrik: Rubrik[]; awal: TulisanSaya[] }) {
  const rubrikAwal = rubrik[0]?.slug ?? '';
  return (
    <>
      <section className="card pad" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Tulisan baru</h2>
        <FormDraf rubrik={rubrik} awal={{ judul: '', rubrikSlug: rubrikAwal, isi: '' }} />
      </section>

      <h2 style={{ marginTop: 28 }}>Tulisanku</h2>
      {awal.length === 0 ? (
        <p className="muted">Belum ada tulisan. Mulai dari formulir di atas.</p>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {awal.map((t) => (
            <article key={t.id} className="card pad">
              <div className="tagl">{t.rubrik} · {KOLOM[t.status].judul}</div>
              {t.status === 'draf' ? (
                <FormDraf rubrik={rubrik} id={t.id} awal={{ judul: t.judul, rubrikSlug: t.rubrikSlug, isi: t.isi }} />
              ) : (
                <>
                  <h3 style={{ margin: '8px 0' }}>{t.judul}</h3>
                  <p className="muted">
                    {KOLOM[t.status].deskripsi}. Tulisan yang sudah diajukan tidak bisa diubah dari sini; hubungi editor jika perlu perubahan.
                  </p>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
