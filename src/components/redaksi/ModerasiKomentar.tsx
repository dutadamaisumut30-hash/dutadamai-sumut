'use client';

import { useState } from 'react';
import { pindahKomentar, type StatusKomentar } from '@/fitur/moderasi/komentar';
import { bolehAksi, PERAN, type Peran } from '@/lib/izin';
import { KOMENTAR_CONTOH, type KomentarContoh } from '@/lib/komentar-contoh';

const LABEL: Record<StatusKomentar, string> = { menunggu: 'Menunggu', tampil: 'Tampil', disembunyikan: 'Disembunyikan' };
const NAMA_PERAN: Record<Peran, string> = { publik: 'Publik', blogger: 'Blogger', dkv: 'DKV', editor: 'Editor', admin: 'Admin' };

export function ModerasiKomentar() {
  const [peran, setPeran] = useState<Exclude<Peran, 'publik'>>('editor');
  const [items, setItems] = useState<KomentarContoh[]>(KOMENTAR_CONTOH);
  const [pesan, setPesan] = useState('');
  const boleh = bolehAksi(peran, 'moderasi');

  // Laporan terbanyak di atas, agar yang paling perlu dilihat lebih dulu.
  const urut = [...items].sort((a, b) => b.laporan - a.laporan);

  function pindah(id: string, ke: StatusKomentar) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const hasil = pindahKomentar({ dari: item.status, ke, peran });
    if (!hasil.ok) return setPesan(hasil.alasan);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: ke } : i)));
    setPesan(`Komentar ${LABEL[ke].toLowerCase()}.`);
  }

  return (
    <>
      <div className="papan-tools">
        <label htmlFor="peran-komentar">Lihat sebagai</label>
        <select id="peran-komentar" value={peran} onChange={(e) => { setPeran(e.target.value as Exclude<Peran, 'publik'>); setPesan(''); }}>
          {PERAN.filter((p): p is Exclude<Peran, 'publik'> => p !== 'publik').map((p) => (
            <option key={p} value={p}>{NAMA_PERAN[p]}</option>
          ))}
        </select>
      </div>
      <div className="warn">Pratinjau tanpa login. Perubahan di sini belum tersimpan ke database.</div>
      {!boleh && <div className="warn" style={{ marginTop: 14 }}>Moderasi hanya bisa dilakukan Editor dan Admin.</div>}
      {boleh && pesan && <div className="ok" role="status" style={{ marginTop: 12 }}>{pesan}</div>}

      {boleh && (
        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {urut.map((k) => (
            <article key={k.id} className="card pad">
              <div className="tagl">{LABEL[k.status]}{k.laporan > 0 && <> · {k.laporan} laporan</>}</div>
              <p style={{ margin: '6px 0' }}>&ldquo;{k.isi}&rdquo;</p>
              <p className="muted" style={{ margin: 0 }}>oleh {k.oleh} · pada {k.tulisan}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {k.status === 'menunggu' && <>
                  <button type="button" className="btn" onClick={() => pindah(k.id, 'tampil')}>Setujui</button>
                  <button type="button" className="btn btn-ghost" onClick={() => pindah(k.id, 'disembunyikan')}>Sembunyikan</button>
                </>}
                {k.status === 'tampil' && <button type="button" className="btn btn-ghost" onClick={() => pindah(k.id, 'disembunyikan')}>Sembunyikan</button>}
                {k.status === 'disembunyikan' && <button type="button" className="btn" onClick={() => pindah(k.id, 'tampil')}>Tampilkan lagi</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
