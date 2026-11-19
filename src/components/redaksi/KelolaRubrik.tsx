'use client';

import { useState } from 'react';
import { RUBRIK, type Rubrik } from '@/lib/data-contoh';
import { bolehAksi, PERAN, type Peran } from '@/lib/izin';

const NAMA_PERAN: Record<Peran, string> = { publik: 'Publik', blogger: 'Blogger', dkv: 'DKV', editor: 'Editor', admin: 'Admin' };

// ADR 001: rubrik dikelola Editor dan Admin. Blogger hanya memilih rubrik untuk draf sendiri.
export function KelolaRubrik() {
  const [peran, setPeran] = useState<Exclude<Peran, 'publik'>>('editor');
  const [daftar, setDaftar] = useState<Rubrik[]>(RUBRIK);
  const [sedang, setSedang] = useState<string | null>(null);
  const [teks, setTeks] = useState('');
  const [pesan, setPesan] = useState('');

  const boleh = bolehAksi(peran, 'kelola_rubrik');

  function mulai(r: Rubrik) {
    setSedang(r.slug);
    setTeks(r.deskripsi);
    setPesan('');
  }

  function simpan(slug: string) {
    if (!teks.trim()) return setPesan('Deskripsi rubrik tidak boleh kosong.');
    setDaftar((prev) => prev.map((r) => (r.slug === slug ? { ...r, deskripsi: teks.trim() } : r)));
    setSedang(null);
    setPesan('Deskripsi rubrik disimpan (pratinjau, belum tersimpan ke database).');
  }

  return (
    <>
      <div className="papan-tools">
        <label htmlFor="peran-rubrik">Lihat sebagai</label>
        <select id="peran-rubrik" value={peran} onChange={(e) => { setPeran(e.target.value as Exclude<Peran, 'publik'>); setSedang(null); setPesan(''); }}>
          {PERAN.filter((p): p is Exclude<Peran, 'publik'> => p !== 'publik').map((p) => (
            <option key={p} value={p}>{NAMA_PERAN[p]}</option>
          ))}
        </select>
      </div>

      {!boleh && <div className="warn" style={{ marginTop: 14 }}>Rubrik hanya bisa dikelola Editor dan Admin.</div>}
      {boleh && pesan && <div className="ok" role="status" style={{ marginTop: 12 }}>{pesan}</div>}

      {boleh && (
        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {daftar.map((r) => (
            <article key={r.slug} className="card pad">
              <div className="tagl">{r.nama} · /{r.slug}</div>
              {sedang === r.slug ? (
                <>
                  <label htmlFor={`rubrik-${r.slug}`}>Deskripsi</label>
                  <textarea id={`rubrik-${r.slug}`} rows={3} value={teks} onChange={(e) => setTeks(e.target.value)} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button type="button" className="btn" onClick={() => simpan(r.slug)}>Simpan</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setSedang(null)}>Batal</button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ margin: '8px 0' }}>{r.deskripsi}</p>
                  <button type="button" className="btn btn-ghost" onClick={() => mulai(r)}>Ubah deskripsi</button>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
