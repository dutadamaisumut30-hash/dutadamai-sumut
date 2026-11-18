'use client';

import { useState } from 'react';
import type { KaryaContoh } from '@/lib/data-contoh';
import { KartuKarya } from './KartuKarya';

type Filter = 'semua' | 'tulisan' | 'desain';
const LABEL: Record<Filter, string> = { semua: 'Semua', tulisan: 'Tulisan', desain: 'Desain' };

export function KaryaGrid({ karya }: { karya: KaryaContoh[] }) {
  const [filter, setFilter] = useState<Filter>('semua');
  const tampil = karya.filter((k) => filter === 'semua' || k.jenis === filter);

  return (
    <>
      <div className="filter" role="group" aria-label="Filter jenis karya">
        {(Object.keys(LABEL) as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            className={filter === f ? 'on' : ''}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {LABEL[f]}
          </button>
        ))}
      </div>
      {tampil.length === 0 && <p className="muted">Belum ada karya di kategori ini. Coba pilih Semua.</p>}
      <div className="grid3">
        {tampil.map((k) => (
          <KartuKarya key={k.id} k={k} />
        ))}
      </div>
    </>
  );
}
