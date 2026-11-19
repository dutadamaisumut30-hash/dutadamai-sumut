'use client';

import { useState } from 'react';
import { pindahSaran, type StatusSaran } from '@/fitur/saran/alur-saran';
import { bolehAksi, type Peran } from '@/lib/izin';
import { SARAN_CONTOH, type ItemSaran } from '@/lib/saran-contoh';

const LABEL: Record<StatusSaran, string> = { baru: 'Baru', dibaca: 'Dibaca', ditindak: 'Ditindak', diarsip: 'Diarsip' };
const PILIH_PERAN: Exclude<Peran, 'publik'>[] = ['blogger', 'dkv', 'editor', 'admin'];

export function ModerasiSaran() {
  const [peran, setPeran] = useState<Exclude<Peran, 'publik'>>('editor');
  const [items, setItems] = useState<ItemSaran[]>(SARAN_CONTOH);
  const [pesan, setPesan] = useState('');

  function pindah(id: string, ke: StatusSaran) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const hasil = pindahSaran({ dari: item.status, ke, peran });
    if (!hasil.ok) return setPesan(hasil.alasan);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: ke } : i)));
    setPesan(`Saran dipindah ke ${LABEL[ke]}.`);
  }

  const boleh = bolehAksi(peran, 'baca_kotak_saran');

  return (
    <>
      <div className="papan-tools">
        <label htmlFor="peran-saran">Lihat sebagai</label>
        <select id="peran-saran" value={peran} onChange={(e) => { setPeran(e.target.value as Exclude<Peran, 'publik'>); setPesan(''); }}>
          {PILIH_PERAN.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="warn">Pratinjau tanpa login. Perubahan di sini belum tersimpan ke database.</div>

      {!boleh && (
        <div className="warn" style={{ marginTop: 14 }}>
          Kotak saran hanya bisa dibaca oleh Editor dan Admin.
        </div>
      )}

      {boleh && pesan && <div className="ok" role="status" style={{ marginTop: 12 }}>{pesan}</div>}

      {boleh && (
        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {items.map((i) => (
            <article key={i.id} className="card pad">
              <div className="tagl">{i.kategori} · {i.diterima}</div>
              <p style={{ margin: '8px 0' }}>{i.pesan}</p>
              <div className="muted">Status: {LABEL[i.status]}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {i.status === 'baru' && (
                  <button type="button" className="btn" onClick={() => pindah(i.id, 'dibaca')}>Tandai dibaca</button>
                )}
                {i.status === 'dibaca' && (
                  <button type="button" className="btn" onClick={() => pindah(i.id, 'ditindak')}>Tindak lanjut</button>
                )}
                {i.status !== 'diarsip' && (
                  <button type="button" className="btn btn-ghost" onClick={() => pindah(i.id, 'diarsip')}>Arsipkan</button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
