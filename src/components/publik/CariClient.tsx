'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { RUBRIK, TULISAN, type NamaRubrik } from '@/lib/data-contoh';

export function CariClient() {
  const [q, setQ] = useState('');
  const [rubrik, setRubrik] = useState<NamaRubrik | 'semua'>('semua');

  const hasil = useMemo(() => {
    const kata = q.trim().toLowerCase();
    return TULISAN.filter(
      (t) =>
        (rubrik === 'semua' || t.rubrik === rubrik) &&
        (kata === '' || `${t.judul} ${t.ringkasan}`.toLowerCase().includes(kata)),
    );
  }, [q, rubrik]);

  return (
    <div className="narrow">
      <h1>Cari tulisan</h1>
      <label htmlFor="q">Kata kunci</label>
      <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ketik kata kunci, misalnya: toleransi" />
      <div className="filter" role="group" aria-label="Filter rubrik">
        <button type="button" className={rubrik === 'semua' ? 'on' : ''} onClick={() => setRubrik('semua')}>Semua rubrik</button>
        {RUBRIK.map((r) => (
          <button key={r.slug} type="button" className={rubrik === r.nama ? 'on' : ''} onClick={() => setRubrik(r.nama)}>
            {r.nama}
          </button>
        ))}
      </div>
      {hasil.length === 0 ? (
        <p className="muted">Belum ada tulisan tentang itu. Coba kata lain?</p>
      ) : (
        hasil.map((t) => (
          <article key={t.slug} className="card pad" style={{ marginTop: 12 }}>
            <span className="tagl">{t.rubrik}</span>
            <h3><Link href={`/berita/${t.slug}`}>{t.judul}</Link></h3>
          </article>
        ))
      )}
    </div>
  );
}
