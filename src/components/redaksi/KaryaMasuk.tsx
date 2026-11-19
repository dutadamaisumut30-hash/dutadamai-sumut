'use client';

import { useState } from 'react';
import { pindahSeleksi } from '@/fitur/karya/pindah-seleksi';
import type { TahapKarya } from '@/fitur/karya/alur-seleksi';
import { bolehAksi, PERAN, type Peran } from '@/lib/izin';
import { KARYA_MASUK_CONTOH, type KaryaMasuk } from '@/lib/karya-masuk-contoh';

const LABEL: Record<TahapKarya, string> = {
  formulir: 'Formulir', antrean: 'Antrean redaksi', keputusan: 'Keputusan layak',
  dihubungi: 'Redaksi menghubungi pengirim', dikembalikan: 'Dikembalikan dengan catatan',
  terbit: 'Terbit', ditolak: 'Ditolak',
};
const NAMA_PERAN: Record<Peran, string> = { publik: 'Publik', blogger: 'Blogger', dkv: 'DKV', editor: 'Editor', admin: 'Admin' };

export function KaryaMasuk() {
  const [peran, setPeran] = useState<Exclude<Peran, 'publik'>>('editor');
  const [items, setItems] = useState<KaryaMasuk[]>(KARYA_MASUK_CONTOH);
  const [pesan, setPesan] = useState('');
  const [kembali, setKembali] = useState<string | null>(null);
  const [catatan, setCatatan] = useState('');
  const boleh = bolehAksi(peran, 'seleksi_karya');

  function pindah(id: string, ke: TahapKarya, catatanIsi?: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const hasil = pindahSeleksi({ dari: item.tahap, ke, peran, catatan: catatanIsi });
    if (!hasil.ok) return setPesan(hasil.alasan);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, tahap: ke, catatan: catatanIsi ?? i.catatan } : i)));
    setKembali(null);
    setCatatan('');
    setPesan(`"${item.judul}" pindah ke ${LABEL[ke]}.`);
  }

  return (
    <>
      <div className="papan-tools">
        <label htmlFor="peran-karya">Lihat sebagai</label>
        <select id="peran-karya" value={peran} onChange={(e) => { setPeran(e.target.value as Exclude<Peran, 'publik'>); setPesan(''); setKembali(null); }}>
          {PERAN.filter((p): p is Exclude<Peran, 'publik'> => p !== 'publik').map((p) => (
            <option key={p} value={p}>{NAMA_PERAN[p]}</option>
          ))}
        </select>
      </div>
      <div className="warn">Pratinjau tanpa login. Perubahan di sini belum tersimpan ke database. Data kontak pengirim tidak ditampilkan di sini.</div>
      {!boleh && <div className="warn" style={{ marginTop: 14 }}>Karya masuk hanya bisa diseleksi Editor dan Admin.</div>}
      {boleh && pesan && <div className="ok" role="status" style={{ marginTop: 12 }}>{pesan}</div>}

      {boleh && (
        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {items.map((i) => (
            <article key={i.id} className="card pad">
              <div className="tagl">{i.jenis} · {i.diterima}</div>
              <h3 style={{ margin: '6px 0' }}>{i.judul}</h3>
              <p className="muted" style={{ margin: 0 }}>oleh {i.oleh} · {LABEL[i.tahap]}</p>
              {i.catatan && <p style={{ marginTop: 6 }}>Catatan: {i.catatan}</p>}

              {kembali === i.id && (
                <div style={{ marginTop: 10 }}>
                  <label htmlFor={`catatan-${i.id}`}>Catatan wajib untuk pengirim</label>
                  <textarea id={`catatan-${i.id}`} rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
                  <button type="button" className="btn" disabled={!catatan.trim()} onClick={() => pindah(i.id, 'dikembalikan', catatan)}>Kirim pengembalian</button>{' '}
                  <button type="button" className="btn btn-ghost" onClick={() => setKembali(null)}>Batal</button>
                </div>
              )}

              {kembali !== i.id && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {i.tahap === 'antrean' && <button type="button" className="btn" onClick={() => pindah(i.id, 'keputusan')}>Mulai nilai</button>}
                  {i.tahap === 'keputusan' && <>
                    <button type="button" className="btn" onClick={() => pindah(i.id, 'dihubungi')}>Layak, hubungi pengirim</button>
                    <button type="button" className="btn btn-ghost" onClick={() => { setKembali(i.id); setPesan(''); }}>Perlu revisi</button>
                    <button type="button" className="btn btn-ghost" onClick={() => pindah(i.id, 'ditolak')}>Tolak</button>
                  </>}
                  {i.tahap === 'dihubungi' && <button type="button" className="btn" onClick={() => pindah(i.id, 'terbit')}>Terbitkan</button>}
                  {i.tahap === 'dikembalikan' && <button type="button" className="btn btn-ghost" onClick={() => pindah(i.id, 'antrean')}>Tandai revisi masuk</button>}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
