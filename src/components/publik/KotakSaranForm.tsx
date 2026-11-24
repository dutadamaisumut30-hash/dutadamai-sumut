'use client';

import { useState, useTransition } from 'react';
import { kirimSaran } from '@/fitur/saran/actions';
import { BACKEND_SIAP } from '@/lib/status-sistem';
import { KeteranganVerifikasi, Turnstile } from './Turnstile';

const KATEGORI = ['Saran konten', 'Masalah teknis', 'Ide kolaborasi'] as const;

// Selama BACKEND_SIAP false, tombol dinonaktifkan agar tidak ada pesan yang hilang diam-diam.
export function KotakSaranForm() {
  const [kategori, setKategori] = useState<(typeof KATEGORI)[number]>('Saran konten');
  const [pesan, setPesan] = useState('');
  const [kontak, setKontak] = useState('');
  const [err, setErr] = useState('');
  const [terkirim, setTerkirim] = useState(false);

  const [turnstile, setTurnstile] = useState('');
  const [pending, startTransition] = useTransition();

  function kirim() {
    if (!BACKEND_SIAP) {
      setErr('Kotak saran belum tersambung ke server. Pesanmu belum terkirim.');
      return;
    }
    if (!pesan.trim()) return setErr('Pesan wajib diisi.');
    setErr('');
    startTransition(async () => {
      const hasil = await kirimSaran({ kategori, pesan, kontak }, turnstile);
      if (!hasil.ok) return setErr(hasil.pesan);
      setTerkirim(true);
      setPesan('');
      setKontak('');
    });
  }

  if (terkirim) {
    return <div className="ok">Terima kasih, masukanmu sudah sampai ke tim.</div>;
  }

  return (
    <>
      {!BACKEND_SIAP && (
        <div className="warn">Kotak saran sedang disiapkan. Untuk sementara, pesanmu belum bisa dikirim dari halaman ini.</div>
      )}
      <label>Saranmu tentang apa?</label>
      {KATEGORI.map((k) => (
        <button key={k} type="button" className={`opt ${kategori === k ? 'on' : ''}`} onClick={() => setKategori(k)}>
          <b>{k}</b>
        </button>
      ))}
      <label htmlFor="pesan">Pesanmu</label>
      <textarea id="pesan" rows={5} value={pesan} onChange={(e) => setPesan(e.target.value)} placeholder="Tulis saranmu di sini" />
      <label htmlFor="kontak">Email atau WhatsApp (opsional, kalau mau dibalas)</label>
      <input id="kontak" value={kontak} onChange={(e) => setKontak(e.target.value)} />
      <Turnstile onToken={setTurnstile} />
      <KeteranganVerifikasi token={turnstile} sibuk={pending} />
      <div className="err">{err}</div>
      <button type="button" className="btn" onClick={kirim} disabled={pending || !BACKEND_SIAP || !turnstile}>
        {pending ? 'Mengirim…' : 'Kirim saran'}
      </button>
    </>
  );
}
