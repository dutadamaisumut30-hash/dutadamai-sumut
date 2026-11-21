'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { tandaiLaporanAksi } from '@/fitur/laporan/actions';
import type { LaporanDb } from '@/fitur/laporan/layanan';

export function ModerasiLaporan({ awal }: { awal: LaporanDb[] }) {
  const router = useRouter();
  const [pesan, setPesan] = useState('');
  const [galat, setGalat] = useState(false);
  const [sibuk, mulai] = useTransition();

  function tandai(id: string) {
    mulai(async () => {
      const hasil = await tandaiLaporanAksi(id);
      setGalat(!hasil.ok);
      setPesan(hasil.ok ? 'Laporan ditandai selesai ditangani.' : hasil.alasan);
      if (hasil.ok) router.refresh();
    });
  }

  return (
    <>
      {pesan && <div className={galat ? 'warn' : 'ok'} role="status" style={{ marginTop: 12 }}>{pesan}</div>}
      {awal.length === 0 ? (
        <p className="muted" style={{ marginTop: 14 }}>Belum ada laporan.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {awal.map((l) => (
            <article key={l.id} className="card pad">
              <div className="tagl">{l.alasan} · {l.diterima}</div>
              {l.alamat && <p style={{ margin: '8px 0', wordBreak: 'break-word' }}>Halaman: {l.alamat}</p>}
              {l.catatan && <p style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>{l.catatan}</p>}
              <div className="muted">Status: {l.status === 'baru' ? 'Baru' : 'Ditangani'}</div>
              {l.status === 'baru' && (
                <div style={{ marginTop: 10 }}>
                  <button type="button" className="btn" disabled={sibuk} onClick={() => tandai(l.id)}>Tandai ditangani</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
