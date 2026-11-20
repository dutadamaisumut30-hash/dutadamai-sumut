'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { RubrikDb } from '@/fitur/rubrik/layanan';
import { simpanDeskripsiRubrik } from '@/fitur/rubrik/actions';

// ADR 001: rubrik dikelola Editor dan Admin. Blogger hanya memilih rubrik untuk draf sendiri.
export function KelolaRubrik({ awal }: { awal: RubrikDb[] }) {
  const router = useRouter();
  const [sedang, setSedang] = useState<string | null>(null);
  const [teks, setTeks] = useState('');
  const [pesan, setPesan] = useState('');
  const [sibuk, mulai] = useTransition();

  function mulaiUbah(r: RubrikDb) {
    setSedang(r.slug);
    setTeks(r.deskripsi);
    setPesan('');
  }

  function simpan(slug: string) {
    mulai(async () => {
      const hasil = await simpanDeskripsiRubrik(slug, teks);
      if (!hasil.ok) return setPesan(hasil.alasan);
      setSedang(null);
      setPesan('Deskripsi rubrik disimpan.');
      router.refresh();
    });
  }

  return (
    <>
      {pesan && <div className="ok" role="status" style={{ marginTop: 12 }}>{pesan}</div>}
      <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
        {awal.map((r) => (
          <article key={r.slug} className="card pad">
            <div className="tagl">{r.nama} · /{r.slug}</div>
            {sedang === r.slug ? (
              <>
                <label htmlFor={`rubrik-${r.slug}`}>Deskripsi</label>
                <textarea id={`rubrik-${r.slug}`} rows={3} value={teks} onChange={(e) => setTeks(e.target.value)} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="button" className="btn" onClick={() => simpan(r.slug)} disabled={sibuk}>Simpan</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setSedang(null)}>Batal</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ margin: '8px 0' }}>{r.deskripsi}</p>
                <button type="button" className="btn btn-ghost" onClick={() => mulaiUbah(r)} disabled={sibuk}>Ubah deskripsi</button>
              </>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
