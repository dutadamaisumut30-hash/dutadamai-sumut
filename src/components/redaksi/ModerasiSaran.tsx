'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { StatusSaran } from '@/fitur/saran/alur-saran';
import { gantiStatusSaranAksi } from '@/fitur/saran/actions-moderasi';
import type { SaranMasukDb } from '@/fitur/saran/moderasi';

const LABEL: Record<StatusSaran, string> = { baru: 'Baru', dibaca: 'Dibaca', ditindak: 'Ditindak', diarsip: 'Diarsip' };

export function ModerasiSaran({ awal }: { awal: SaranMasukDb[] }) {
  const router = useRouter();
  const [pesan, setPesan] = useState('');
  const [galat, setGalat] = useState(false);
  const [sibuk, mulai] = useTransition();

  function pindah(id: string, ke: StatusSaran) {
    mulai(async () => {
      const hasil = await gantiStatusSaranAksi(id, ke);
      if (!hasil.ok) {
        setGalat(true);
        setPesan(hasil.alasan);
        return;
      }
      setGalat(false);
      setPesan(`Saran dipindah ke ${LABEL[ke]}.`);
      router.refresh();
    });
  }

  return (
    <>
      {pesan && (
        <div className={galat ? 'warn' : 'ok'} role="status" style={{ marginTop: 12 }}>{pesan}</div>
      )}

      {awal.length === 0 ? (
        <p className="muted" style={{ marginTop: 14 }}>Belum ada saran masuk.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {awal.map((i) => (
            <article key={i.id} className="card pad">
              <div className="tagl">{i.kategori} · {i.diterima}</div>
              <p style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>{i.pesan}</p>
              <div className="muted">Status: {LABEL[i.status]}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {i.status === 'baru' && (
                  <button type="button" className="btn" disabled={sibuk} onClick={() => pindah(i.id, 'dibaca')}>Tandai dibaca</button>
                )}
                {i.status === 'dibaca' && (
                  <button type="button" className="btn" disabled={sibuk} onClick={() => pindah(i.id, 'ditindak')}>Tindak lanjut</button>
                )}
                {i.status !== 'diarsip' && (
                  <button type="button" className="btn btn-ghost" disabled={sibuk} onClick={() => pindah(i.id, 'diarsip')}>Arsipkan</button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
