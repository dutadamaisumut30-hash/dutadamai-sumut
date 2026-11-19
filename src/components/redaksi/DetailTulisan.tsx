'use client';

import { useState } from 'react';
import { pindahStatus, STATUS_TULISAN, type StatusTulisan } from '@/fitur/tulisan/alur-status';
import { formatTanggalPendek, KOLOM, labelTelat } from '@/fitur/tulisan/papan';
import type { ItemPapan } from '@/lib/papan-contoh';

const HARI_INI = '2026-11-19';

export function DetailTulisan({ awal }: { awal: ItemPapan }) {
  const [status, setStatus] = useState<StatusTulisan>(awal.status);
  const [mode, setMode] = useState<'biasa' | 'kembalikan'>('biasa');
  const [catatan, setCatatan] = useState('');
  const [pesan, setPesan] = useState('');

  const telat = status !== 'terbit' ? labelTelat(awal.tenggat, HARI_INI) : null;
  const indeksSekarang = STATUS_TULISAN.indexOf(status);

  function setujui() {
    const hasil = pindahStatus({ dari: status, ke: 'terbit', peran: 'editor' });
    if (!hasil.ok) return setPesan(hasil.alasan);
    setStatus('terbit');
    setPesan('Tulisan diterbitkan (pratinjau).');
  }

  function kembalikan() {
    const hasil = pindahStatus({ dari: status, ke: 'didesain', peran: 'editor', catatan });
    if (!hasil.ok) return setPesan(hasil.alasan);
    setStatus('didesain');
    setMode('biasa');
    setCatatan('');
    setPesan('Tulisan dikembalikan ke Didesain dengan catatan.');
  }

  return (
    <div className="detail-grid">
      <article className="card pad">
        <div className="tagl">{awal.rubrik}</div>
        <h2 style={{ marginTop: 6 }}>{awal.judul}</h2>
        <p className="muted">
          Tenggat {formatTanggalPendek(awal.tenggat)}
          {telat && <> · <span style={{ color: 'var(--red)', fontWeight: 700 }}>{telat}</span></>}
        </p>
        <p>Penanggung: {awal.penanggung.join(', ')}</p>

        <h3 style={{ marginTop: 18 }}>Alur status</h3>
        <ol className="alur-status">
          {STATUS_TULISAN.map((s, i) => (
            <li key={s} className={i < indeksSekarang ? 'lewat' : i === indeksSekarang ? 'sekarang' : ''}>
              {KOLOM[s].nomor} · {KOLOM[s].judul}
            </li>
          ))}
        </ol>
      </article>

      <aside className="card pad">
        <div className="muted">Status sekarang</div>
        <h2 style={{ marginTop: 4 }}>{KOLOM[status].judul}</h2>
        <p className="muted">{KOLOM[status].deskripsi}</p>

        {pesan && <div className="ok" role="status" style={{ marginTop: 12 }}>{pesan}</div>}

        {status === 'review_akhir' && mode === 'biasa' && (
          <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
            <button type="button" className="btn" onClick={setujui}>Setujui dan terbitkan</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setMode('kembalikan'); setPesan(''); }}>
              Kembalikan ke Didesain
            </button>
          </div>
        )}

        {status === 'review_akhir' && mode === 'kembalikan' && (
          <div style={{ marginTop: 14 }}>
            <label htmlFor="catatan-kembali">Catatan wajib untuk DKV dan Blogger</label>
            <textarea id="catatan-kembali" rows={4} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
            <button type="button" className="btn" onClick={kembalikan} disabled={!catatan.trim()}>
              Kirim pengembalian
            </button>{' '}
            <button type="button" className="btn btn-ghost" onClick={() => setMode('biasa')}>Batal</button>
          </div>
        )}

        {status !== 'review_akhir' && status !== 'terbit' && (
          <p className="muted" style={{ marginTop: 14 }}>
            Tidak ada aksi editor di status ini. Pindahkan lewat papan redaksi.
          </p>
        )}
        {status === 'terbit' && <p className="muted" style={{ marginTop: 14 }}>Sudah terbit.</p>}

        <p style={{ marginTop: 18 }}>
          <a href="/redaksi">← Kembali ke papan</a>
        </p>
      </aside>
    </div>
  );
}
