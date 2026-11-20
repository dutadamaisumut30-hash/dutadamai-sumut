'use client';

import { useState, useTransition } from 'react';
import { Turnstile } from '@/components/publik/Turnstile';
import { kirimKomentarPublik } from '@/fitur/komentar/actions';

export function KomentarForm({ tulisanId }: { tulisanId: string }) {
  const [nama, setNama] = useState('');
  const [isi, setIsi] = useState('');
  const [turnstile, setTurnstile] = useState('');
  const [pesan, setPesan] = useState('');
  const [terkirim, setTerkirim] = useState(false);
  const [pending, startTransition] = useTransition();

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    setPesan('');
    startTransition(async () => {
      const hasil = await kirimKomentarPublik(tulisanId, { nama, isi }, turnstile);
      if (!hasil.ok) {
        setPesan(hasil.pesan);
        return;
      }
      setTerkirim(true);
      setNama('');
      setIsi('');
    });
  }

  if (terkirim) {
    return <p className="ok" role="status">Terima kasih. Komentarmu akan tampil setelah ditinjau redaksi.</p>;
  }

  return (
    <form onSubmit={kirim} style={{ marginTop: 16, display: 'grid', gap: 8 }}>
      <label htmlFor="nama-komentar">Nama</label>
      <input id="nama-komentar" value={nama} onChange={(e) => setNama(e.target.value)} required />
      <label htmlFor="isi-komentar">Komentar</label>
      <textarea id="isi-komentar" rows={4} value={isi} onChange={(e) => setIsi(e.target.value)} required />
      <Turnstile onToken={setTurnstile} />
      {pesan && <p role="alert" style={{ color: 'var(--red)' }}>{pesan}</p>}
      <button type="submit" className="btn" disabled={pending || !turnstile}>Kirim komentar</button>
    </form>
  );
}
