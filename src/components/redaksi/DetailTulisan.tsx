'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { STATUS_TULISAN, type StatusTulisan } from '@/fitur/tulisan/alur-status';
import { gantiStatus } from '@/fitur/tulisan/actions';
import type { ItemPapanDb } from '@/fitur/tulisan/layanan';
import type { BerkasInfo } from '@/fitur/berkas/layanan';
import { unggahDesainTulisan } from '@/fitur/berkas/actions';
import { formatTanggalPendek, KOLOM, labelTelat } from '@/fitur/tulisan/papan';

export function DetailTulisan({
  awal,
  hariIni,
  bisaReview,
  berkas,
}: {
  awal: ItemPapanDb;
  hariIni: string;
  bisaReview: boolean;
  berkas: BerkasInfo[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusTulisan>(awal.status);
  const [mode, setMode] = useState<'biasa' | 'kembalikan'>('biasa');
  const [catatan, setCatatan] = useState('');
  const [pesan, setPesan] = useState('');
  const [pesanBerkas, setPesanBerkas] = useState('');
  const [sibuk, startTransition] = useTransition();

  const telat = status !== 'terbit' ? labelTelat(awal.tenggat, hariIni) : null;
  const indeksSekarang = STATUS_TULISAN.indexOf(status);

  function setujui() {
    startTransition(async () => {
      const hasil = await gantiStatus(awal.id, 'terbit');
      if (!hasil.ok) {
        setPesan(hasil.pesan);
        return;
      }
      setStatus('terbit');
      setPesan('Tulisan diterbitkan.');
    });
  }

  function kembalikan() {
    startTransition(async () => {
      const hasil = await gantiStatus(awal.id, 'didesain', catatan.trim());
      if (!hasil.ok) {
        setPesan(hasil.pesan);
        return;
      }
      setStatus('didesain');
      setMode('biasa');
      setCatatan('');
      setPesan('Tulisan dikembalikan ke Didesain dengan catatan.');
    });
  }

  function unggah(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formulir = e.currentTarget;
    const fd = new FormData(formulir);
    startTransition(async () => {
      const hasil = await unggahDesainTulisan(fd);
      if (!hasil.ok) {
        setPesanBerkas(hasil.pesan);
        return;
      }
      formulir.reset();
      setPesanBerkas('Berkas diunggah.');
      router.refresh();
    });
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

        {bisaReview && status === 'review_akhir' && mode === 'biasa' && (
          <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
            <button type="button" className="btn" onClick={setujui} disabled={sibuk}>Setujui dan terbitkan</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setMode('kembalikan'); setPesan(''); }}>
              Kembalikan ke Didesain
            </button>
          </div>
        )}

        {bisaReview && status === 'review_akhir' && mode === 'kembalikan' && (
          <div style={{ marginTop: 14 }}>
            <label htmlFor="catatan-kembali">Catatan wajib untuk DKV dan Blogger</label>
            <textarea id="catatan-kembali" rows={4} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
            <button type="button" className="btn" onClick={kembalikan} disabled={!catatan.trim() || sibuk}>
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

        <div style={{ marginTop: 22 }}>
          <strong>Berkas desain</strong>
          {berkas.length === 0 ? (
            <p className="muted">Belum ada berkas.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {berkas.map((b) => (
                <li key={b.id}>
                  <a href={`/api/berkas/${b.id}`} target="_blank" rel="noopener noreferrer">{b.namaAsli}</a>{' '}
                  <span className="muted">({Math.max(1, Math.round(b.ukuran / 1024))} KB)</span>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={unggah} style={{ display: 'grid', gap: 8, marginTop: 8 }}>
            <input type="hidden" name="tulisanId" value={awal.id} />
            <label htmlFor="berkas-desain">Unggah cover atau kartu (PNG, JPG, atau PDF, maksimal 10 MB)</label>
            <input id="berkas-desain" name="berkas" type="file" accept=".png,.jpg,.jpeg,.pdf" required />
            <button type="submit" className="btn" disabled={sibuk}>Unggah berkas</button>
          </form>
          {pesanBerkas && <p role="status" style={{ marginTop: 8 }}>{pesanBerkas}</p>}
        </div>

        <p style={{ marginTop: 18 }}>
          <a href="/redaksi">← Kembali ke papan</a>
        </p>
      </aside>
    </div>
  );
}
