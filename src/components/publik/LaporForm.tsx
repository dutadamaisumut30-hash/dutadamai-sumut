'use client';

import { useState, useTransition } from 'react';
import { kirimLaporan } from '@/fitur/laporan/actions';
import { Turnstile } from './Turnstile';

const ALASAN = ['Ujaran kebencian atau SARA', 'Data pribadi orang lain', 'Promosi atau spam', 'Lainnya'] as const;

export function LaporForm() {
  const [alasan, setAlasan] = useState<(typeof ALASAN)[number]>(ALASAN[0]);
  const [alamat, setAlamat] = useState('');
  const [catatan, setCatatan] = useState('');
  const [turnstile, setTurnstile] = useState('');
  const [err, setErr] = useState('');
  const [terkirim, setTerkirim] = useState(false);
  const [pending, mulai] = useTransition();

  function kirim() {
    setErr('');
    mulai(async () => {
      const hasil = await kirimLaporan({ alasan, alamat, catatan }, turnstile);
      if (!hasil.ok) return setErr(hasil.pesan);
      setTerkirim(true);
    });
  }

  if (terkirim) return <div className="ok" role="status">Terima kasih, laporanmu sudah masuk ke antrean moderasi.</div>;

  return (
    <>
      <label htmlFor="lr">Alasan</label>
      <select id="lr" value={alasan} onChange={(e) => setAlasan(e.target.value as (typeof ALASAN)[number])}>
        {ALASAN.map((a) => <option key={a}>{a}</option>)}
      </select>
      <label htmlFor="la">Alamat halaman yang dilaporkan (opsional)</label>
      <input id="la" value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Tempel alamat halaman atau nama tulisan" />
      <label htmlFor="lc">Catatan{alasan === 'Lainnya' ? '' : ' (opsional)'}</label>
      <textarea id="lc" rows={4} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
      <Turnstile onToken={setTurnstile} />
      <div className="err">{err}</div>
      <button type="button" className="btn" onClick={kirim} disabled={pending || !turnstile}>
        {pending ? 'Mengirim…' : 'Kirim laporan'}
      </button>
    </>
  );
}
