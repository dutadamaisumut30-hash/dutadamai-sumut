'use client';

import { useState, useTransition } from 'react';
import { gantiStatusKomentar } from '@/fitur/komentar/actions';
import type { KomentarModerasi } from '@/fitur/komentar/layanan';
import type { StatusKomentar } from '@/fitur/moderasi/komentar';

const LABEL: Record<StatusKomentar, string> = { menunggu: 'Menunggu', tampil: 'Tampil', disembunyikan: 'Disembunyikan' };

export function ModerasiKomentar({ awal }: { awal: KomentarModerasi[] }) {
  const [items, setItems] = useState<KomentarModerasi[]>(awal);
  const [pesan, setPesan] = useState('');
  const [sibuk, startTransition] = useTransition();

  // Laporan terbanyak di atas, agar yang paling perlu dilihat lebih dulu.
  const urut = [...items].sort((a, b) => b.laporan - a.laporan);

  function pindah(id: string, ke: StatusKomentar) {
    startTransition(async () => {
      const hasil = await gantiStatusKomentar(id, ke);
      if (!hasil.ok) {
        setPesan(hasil.pesan);
        return;
      }
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: ke } : i)));
      setPesan(`Komentar ${LABEL[ke].toLowerCase()}.`);
    });
  }

  return (
    <>
      {pesan && <div className="ok" role="status" style={{ marginTop: 12 }}>{pesan}</div>}
      {items.length === 0 && <p className="muted" style={{ marginTop: 14 }}>Belum ada komentar.</p>}

      <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
        {urut.map((k) => (
          <article key={k.id} className="card pad">
            <div className="tagl">{LABEL[k.status]}{k.laporan > 0 && <> · {k.laporan} laporan</>}</div>
            <p style={{ margin: '6px 0' }}>&ldquo;{k.isi}&rdquo;</p>
            <p className="muted" style={{ margin: 0 }}>oleh {k.nama} · pada {k.judul}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {k.status === 'menunggu' && <>
                <button type="button" className="btn" disabled={sibuk} onClick={() => pindah(k.id, 'tampil')}>Setujui</button>
                <button type="button" className="btn btn-ghost" disabled={sibuk} onClick={() => pindah(k.id, 'disembunyikan')}>Sembunyikan</button>
              </>}
              {k.status === 'tampil' && <button type="button" className="btn btn-ghost" disabled={sibuk} onClick={() => pindah(k.id, 'disembunyikan')}>Sembunyikan</button>}
              {k.status === 'disembunyikan' && <button type="button" className="btn" disabled={sibuk} onClick={() => pindah(k.id, 'tampil')}>Tampilkan lagi</button>}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
