'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { TulisanPublik } from '@/fitur/publik/layanan';

export function CariClient({ tulisan, rubrik }: { tulisan: TulisanPublik[]; rubrik: { slug: string; nama: string }[] }) {
  const [q, setQ] = useState('');
  const [rubrikPilih, setRubrikPilih] = useState<string>('semua');

  const hasil = useMemo(() => {
    const kata = q.trim().toLowerCase();
    return tulisan.filter(
      (t) =>
        (rubrikPilih === 'semua' || t.rubrik === rubrikPilih) &&
        (kata === '' || `${t.judul} ${t.ringkasan}`.toLowerCase().includes(kata)),
    );
  }, [q, rubrikPilih, tulisan]);

  return (
    <div className="narrow">
      <h1>Cari tulisan</h1>
      <label htmlFor="q">Kata kunci</label>
      <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ketik kata kunci, misalnya: toleransi" />
      <div className="filter" role="group" aria-label="Filter rubrik">
        <button type="button" className={rubrikPilih === 'semua' ? 'on' : ''} onClick={() => setRubrikPilih('semua')}>Semua rubrik</button>
        {rubrik.map((r) => (
          <button key={r.slug} type="button" className={rubrikPilih === r.nama ? 'on' : ''} onClick={() => setRubrikPilih(r.nama)}>
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
