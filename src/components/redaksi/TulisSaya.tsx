'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ajukanDrafAksi, buatDrafAksi, hapusDrafAksi, simpanDrafAksi } from '@/fitur/tulis/actions';
import type { TulisanSaya } from '@/fitur/tulis/layanan';
import { KOLOM } from '@/fitur/tulisan/papan';
import { STATUS_TULISAN } from '@/fitur/tulisan/alur-status';

type Rubrik = { slug: string; nama: string };

interface Isian { judul: string; rubrikSlug: string; isi: string }

function FormDraf({
  rubrik, awal, id, sudahAjukan,
}: { rubrik: Rubrik[]; awal: Isian; id?: string; sudahAjukan?: boolean }) {
  const router = useRouter();
  const [f, setF] = useState<Isian>(awal);
  const [pesan, setPesan] = useState('');
  const [galat, setGalat] = useState(false);
  const [sibuk, mulai] = useTransition();
  const baru = !id;
  const [konfirmasi, setKonfirmasi] = useState(false);

  function hapus() {
    if (!id) return;
    mulai(async () => {
      const h = await hapusDrafAksi(id);
      if (!h.ok) return selesai(false, h.pesan);
      router.refresh();
    });
  }

  function selesai(ok: boolean, teks: string) {
    setGalat(!ok);
    setPesan(teks);
    if (ok) router.refresh();
  }

  function simpan() {
    mulai(async () => {
      if (baru) {
        const h = await buatDrafAksi(f);
        if (h.ok) setF({ judul: '', rubrikSlug: f.rubrikSlug, isi: '' });
        return selesai(h.ok, h.ok ? 'Draf tersimpan.' : h.pesan);
      }
      const h = await simpanDrafAksi(id, f);
      selesai(h.ok, h.ok ? 'Perubahan tersimpan.' : h.pesan);
    });
  }

  function ajukan() {
    if (!id) return;
    mulai(async () => {
      const s = await simpanDrafAksi(id, f);
      if (!s.ok) return selesai(false, s.pesan);
      const h = await ajukanDrafAksi(id);
      selesai(h.ok, h.ok ? 'Diajukan ke desain.' : h.pesan);
    });
  }

  const idf = id ?? 'baru';
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label htmlFor={`j-${idf}`}>Judul</label>
      <input id={`j-${idf}`} value={f.judul} onChange={(e) => setF({ ...f, judul: e.target.value })} />
      <label htmlFor={`r-${idf}`}>Rubrik</label>
      <select id={`r-${idf}`} value={f.rubrikSlug} onChange={(e) => setF({ ...f, rubrikSlug: e.target.value })}>
        {rubrik.map((r) => <option key={r.slug} value={r.slug}>{r.nama}</option>)}
      </select>
      <label htmlFor={`i-${idf}`}>Isi (pisahkan paragraf dengan baris kosong)</label>
      <textarea id={`i-${idf}`} rows={8} value={f.isi} onChange={(e) => setF({ ...f, isi: e.target.value })} />
      {pesan && <div className={galat ? 'warn' : 'ok'} role="status">{pesan}</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-ghost" disabled={sibuk} onClick={simpan}>
          {baru ? 'Simpan sebagai draf' : 'Simpan perubahan'}
        </button>
        {!baru && !sudahAjukan && (
          <button type="button" className="btn" disabled={sibuk} onClick={ajukan}>Ajukan ke desain</button>
        )}
        {!baru && !sudahAjukan && (konfirmasi ? (
          <>
            <button type="button" className="btn at-bahaya" disabled={sibuk} onClick={hapus}>Ya, hapus draf ini</button>
            <button type="button" className="btn btn-ghost" disabled={sibuk} onClick={() => setKonfirmasi(false)}>Batal</button>
          </>
        ) : (
          <button type="button" className="btn btn-ghost at-hapus-btn" disabled={sibuk} onClick={() => setKonfirmasi(true)}>Hapus draf</button>
        ))}
      </div>
    </div>
  );
}

export function TulisSaya({ rubrik, awal }: { rubrik: Rubrik[]; awal: TulisanSaya[] }) {
  const rubrikAwal = rubrik[0]?.slug ?? '';
  const urutan = STATUS_TULISAN;
  const grup = urutan
    .map((st) => ({ st, daftar: awal.filter((t) => t.status === st) }))
    .filter((g) => g.daftar.length > 0);
  return (
    <>
      <details className="lipat card" open={awal.length === 0}>
        <summary className="lipat-kepala"><span>Tulisan baru</span><span className="lipat-hint">Klik untuk membuka formulir</span></summary>
        <div className="lipat-isi">
          <FormDraf rubrik={rubrik} awal={{ judul: '', rubrikSlug: rubrikAwal, isi: '' }} />
        </div>
      </details>

      <h2 style={{ marginTop: 28 }}>Tulisanku <span className="muted" style={{ fontSize: 15 }}>({awal.length})</span></h2>
      {awal.length === 0 ? (
        <p className="muted">Belum ada tulisan. Mulai dari formulir di atas.</p>
      ) : (
        <div className="lipat-daftar">
          {grup.map(({ st, daftar }) => {
            const adaCatatan = daftar.some((t) => t.catatanRevisi && t.status !== 'terbit');
            return (
              <details key={st} className="lipat card" open={st === 'draf' || adaCatatan}>
                <summary className="lipat-kepala">
                  <span>{KOLOM[st].nomor} · {KOLOM[st].judul}</span>
                  <span className="lipat-jumlah">{daftar.length}{adaCatatan ? ' · ada catatan' : ''}</span>
                </summary>
                <div className="lipat-isi lipat-anak">
                  {daftar.map((t) => (
                    <details key={t.id} className="lipat lipat-item" open={Boolean(t.catatanRevisi) && t.status === 'draf'}>
                      <summary className="lipat-kepala lipat-kecil">
                        <span className="lipat-judul">{t.judul}</span>
                        <span className="lipat-hint">{t.rubrik}</span>
                      </summary>
                      <div className="lipat-isi">
                        {t.catatanRevisi && t.status !== 'terbit' && (
                          <div className="warn" role="note"><strong>Catatan dari redaksi:</strong> {t.catatanRevisi}</div>
                        )}
                        {t.status === 'draf' ? (
                          <FormDraf rubrik={rubrik} id={t.id} awal={{ judul: t.judul, rubrikSlug: t.rubrikSlug, isi: t.isi }} />
                        ) : (
                          <p className="muted" style={{ margin: 0 }}>
                            {KOLOM[t.status].deskripsi}. Tulisan yang sudah diajukan tidak bisa diubah dari sini; hubungi editor jika perlu perubahan.
                          </p>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </>
  );
}
