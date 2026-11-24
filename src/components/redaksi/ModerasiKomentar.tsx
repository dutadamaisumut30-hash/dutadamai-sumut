'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { gantiStatusKomentar } from '@/fitur/komentar/actions';
import type { KomentarModerasi } from '@/fitur/komentar/layanan';
import type { StatusKomentar } from '@/fitur/moderasi/komentar';

const LABEL: Record<StatusKomentar, string> = { menunggu: 'Menunggu', tampil: 'Tampil', disembunyikan: 'Disembunyikan' };
type Saring = StatusKomentar | 'semua';

function inisial(nama: string) {
  const b = nama.trim().split(/\s+/);
  return ((b[0]?.[0] ?? '?') + (b.length > 1 ? b[b.length - 1][0] : '')).toUpperCase();
}

export function ModerasiKomentar({ awal }: { awal: KomentarModerasi[] }) {
  const [items, setItems] = useState<KomentarModerasi[]>(awal);
  const [pesan, setPesan] = useState('');
  const [saring, setSaring] = useState<Saring>(awal.some((k) => k.status === 'menunggu') ? 'menunggu' : 'semua');
  const [sibuk, startTransition] = useTransition();

  const hitung = (s: Saring) => (s === 'semua' ? items.length : items.filter((i) => i.status === s).length);
  // Laporan terbanyak di atas, agar yang paling perlu dilihat lebih dulu.
  const urut = useMemo(
    () => [...items].filter((i) => saring === 'semua' || i.status === saring).sort((a, b) => b.laporan - a.laporan),
    [items, saring],
  );

  function pindah(id: string, ke: StatusKomentar) {
    startTransition(async () => {
      const hasil = await gantiStatusKomentar(id, ke);
      if (!hasil.ok) {
        setPesan(hasil.pesan);
        return;
      }
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: ke } : i)));
      setPesan(
        ke === 'tampil'
          ? 'Komentar disetujui dan tampil di bawah artikel.'
          : 'Komentar disembunyikan dari halaman publik.',
      );
    });
  }

  return (
    <>
      <div className="at-filter" role="group" aria-label="Saring komentar" style={{ marginTop: 14 }}>
        {(['menunggu', 'tampil', 'disembunyikan', 'semua'] as Saring[]).map((s) => (
          <button key={s} type="button" className={s === saring ? 'on' : ''} aria-pressed={s === saring} onClick={() => setSaring(s)}>
            {s === 'semua' ? 'Semua' : LABEL[s]} ({hitung(s)})
          </button>
        ))}
      </div>

      {pesan && <div className="ok" role="status" style={{ marginTop: 12 }}>{pesan}</div>}
      {urut.length === 0 && (
        <p className="muted" style={{ marginTop: 14 }}>
          {saring === 'menunggu' ? 'Tidak ada komentar yang menunggu. Semua sudah ditinjau.' : 'Tidak ada komentar di kategori ini.'}
        </p>
      )}

      <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
        {urut.map((k) => (
          <article key={k.id} className="card pad at-kartu">
            <div className="at-kepala">
              <div className="at-avatar" aria-hidden="true">{inisial(k.nama)}</div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0 }}>{k.nama}</h3>
                <div className="at-chip">
                  <span className={k.status === 'disembunyikan' ? 'sembunyi' : ''}>{LABEL[k.status]}</span>
                  {k.laporan > 0 && <span className="sembunyi">{k.laporan} laporan</span>}
                  <span>{k.diterima}</span>
                </div>
              </div>
            </div>
            <p style={{ margin: '4px 0', whiteSpace: 'pre-line' }}>{k.isi}</p>
            <p className="muted" style={{ margin: 0 }}>
              Pada{' '}
              {k.tulisanTerbit
                ? <Link href={`/berita/${k.slug}`} target="_blank">{k.judul}</Link>
                : <>{k.judul} (belum terbit)</>}
            </p>
            <div className="at-aksi">
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
