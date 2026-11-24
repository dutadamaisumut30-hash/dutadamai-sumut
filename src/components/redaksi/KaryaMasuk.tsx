'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { TahapKarya } from '@/fitur/karya/alur-seleksi';
import { bacaKontakKaryaAksi, gantiTahapKaryaAksi } from '@/fitur/karya/actions-seleksi';
import type { KaryaMasukDb } from '@/fitur/karya/seleksi';

const LABEL: Record<TahapKarya, string> = {
  formulir: 'Formulir', antrean: 'Antrean redaksi', keputusan: 'Keputusan layak',
  dihubungi: 'Redaksi menghubungi pengirim', dikembalikan: 'Dikembalikan dengan catatan',
  terbit: 'Terbit', ditolak: 'Ditolak',
};

export function KaryaMasuk({ awal }: { awal: KaryaMasukDb[] }) {
  const router = useRouter();
  const [pesan, setPesan] = useState('');
  const [kembali, setKembali] = useState<string | null>(null);
  const [catatan, setCatatan] = useState('');
  const [kontak, setKontak] = useState<Record<string, string>>({});
  const [sibuk, mulai] = useTransition();

  function bukaKontak(id: string) {
    mulai(async () => {
      const h = await bacaKontakKaryaAksi(id);
      if (!h.ok) return setPesan(h.alasan);
      setKontak((k) => ({ ...k, [id]: [h.kontak, h.namaLengkap, h.sekolah].filter(Boolean).join(' · ') }));
    });
  }

  function pindah(id: string, judul: string, ke: TahapKarya, catatanIsi?: string) {
    mulai(async () => {
      const hasil = await gantiTahapKaryaAksi(id, ke, catatanIsi);
      if (!hasil.ok) return setPesan(hasil.alasan);
      setKembali(null);
      setCatatan('');
      setPesan(`"${judul}" pindah ke ${LABEL[ke]}.`);
      router.refresh();
    });
  }

  return (
    <>
      {pesan && <div className="ok" role="status" style={{ marginTop: 12 }}>{pesan}</div>}
      {awal.length === 0 && <p className="muted" style={{ marginTop: 14 }}>Belum ada karya masuk.</p>}

      <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
        {awal.map((i) => (
          <article key={i.id} className="card pad">
            <div className="tagl">{i.jenis} · {i.diterima}</div>
            <h3 style={{ margin: '6px 0' }}>{i.judul}</h3>
            <p className="muted" style={{ margin: 0 }}>oleh {i.oleh} · {LABEL[i.tahap]}</p>
            {i.catatan && <p style={{ marginTop: 6 }}>Catatan: {i.catatan}</p>}

            {i.isi && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Baca isi karya</summary>
                {i.isi.split(/\n\s*\n/).map((p, n) => <p key={n} style={{ margin: '8px 0', whiteSpace: 'pre-line' }}>{p}</p>)}
              </details>
            )}

            {(i.tahap === 'dihubungi' || i.tahap === 'dikembalikan') && (
              <p style={{ marginTop: 8 }}>
                {kontak[i.id]
                  ? <><strong>Kontak:</strong> {kontak[i.id]}</>
                  : <button type="button" className="btn btn-ghost" disabled={sibuk} onClick={() => bukaKontak(i.id)}>Tampilkan kontak pengirim</button>}
              </p>
            )}

            {i.berkas.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <strong>Berkas desain</strong>
                <ul style={{ paddingLeft: 18 }}>
                  {i.berkas.map((b) => (
                    <li key={b.id}>
                      <a href={`/api/berkas/${b.id}`} target="_blank" rel="noopener noreferrer">{b.namaAsli}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {kembali === i.id && (
              <div style={{ marginTop: 10 }}>
                <label htmlFor={`catatan-${i.id}`}>Catatan wajib untuk pengirim</label>
                <textarea id={`catatan-${i.id}`} rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
                <button type="button" className="btn" disabled={!catatan.trim() || sibuk} onClick={() => pindah(i.id, i.judul, 'dikembalikan', catatan)}>Kirim pengembalian</button>{' '}
                <button type="button" className="btn btn-ghost" onClick={() => setKembali(null)}>Batal</button>
              </div>
            )}

            {kembali !== i.id && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {i.tahap === 'antrean' && <button type="button" className="btn" disabled={sibuk} onClick={() => pindah(i.id, i.judul, 'keputusan')}>Mulai nilai</button>}
                {i.tahap === 'keputusan' && <>
                  <button type="button" className="btn" disabled={sibuk} onClick={() => pindah(i.id, i.judul, 'dihubungi')}>Layak, hubungi pengirim</button>
                  <button type="button" className="btn btn-ghost" disabled={sibuk} onClick={() => { setKembali(i.id); setPesan(''); }}>Perlu revisi</button>
                  <button type="button" className="btn btn-ghost" disabled={sibuk} onClick={() => pindah(i.id, i.judul, 'ditolak')}>Tolak</button>
                </>}
                {i.tahap === 'dihubungi' && <button type="button" className="btn" disabled={sibuk} onClick={() => pindah(i.id, i.judul, 'terbit')}>Terbitkan</button>}
                {i.tahap === 'dikembalikan' && <button type="button" className="btn btn-ghost" disabled={sibuk} onClick={() => pindah(i.id, i.judul, 'antrean')}>Tandai revisi masuk</button>}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
