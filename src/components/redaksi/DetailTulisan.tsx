'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { STATUS_TULISAN, type StatusTulisan } from '@/fitur/tulisan/alur-status';
import { gantiStatus } from '@/fitur/tulisan/actions';
import { hapusTulisanAksi } from '@/fitur/tulis/actions';
import type { ItemPapanDb } from '@/fitur/tulisan/layanan';
import type { BerkasInfo } from '@/fitur/berkas/layanan';
import { hapusBerkasAksi, unggahDesainTulisan } from '@/fitur/berkas/actions';
import { formatTanggalPendek, KOLOM, labelTelat } from '@/fitur/tulisan/papan';

export function DetailTulisan({
  beranda,
  catatanRevisi,
  awal,
  hariIni,
  bisaReview,
  berkas,
}: {
  beranda: string;
  catatanRevisi?: string;
  awal: ItemPapanDb;
  hariIni: string;
  bisaReview: boolean;
  berkas: BerkasInfo[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusTulisan>(awal.status);
  const [mode, setMode] = useState<'biasa' | 'kembalikan'>('biasa');
  const [catatan, setCatatan] = useState('');
  const [tujuan, setTujuan] = useState<StatusTulisan>('draf');
  const [pesan, setPesan] = useState('');
  const [pesanBerkas, setPesanBerkas] = useState('');
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);
  const [sibuk, startTransition] = useTransition();

  const telat = status !== 'terbit' ? labelTelat(awal.tenggat, hariIni) : null;
  const indeksSekarang = STATUS_TULISAN.indexOf(status);

  function hapusSemua() {
    startTransition(async () => {
      const h = await hapusTulisanAksi(awal.id);
      if (!h.ok) { setPesan(h.pesan); setKonfirmasiHapus(false); return; }
      router.push(beranda);
      router.refresh();
    });
  }

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
      const hasil = await gantiStatus(awal.id, tujuan, catatan.trim());
      if (!hasil.ok) {
        setPesan(hasil.pesan);
        return;
      }
      setStatus(tujuan);
      setMode('biasa');
      setCatatan('');
      setPesan(`Tulisan dikembalikan ke ${KOLOM[tujuan].judul} dengan catatan.`);
      router.refresh();
    });
  }

  function hapusBerkas(id: string) {
    startTransition(async () => {
      const hasil = await hapusBerkasAksi(id);
      setPesanBerkas(hasil.ok ? 'Berkas dihapus.' : hasil.pesan);
      if (hasil.ok) router.refresh();
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
        {catatanRevisi && status !== 'terbit' && (
          <div className="warn" role="note"><strong>Catatan revisi terakhir:</strong> {catatanRevisi}</div>
        )}

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

        {bisaReview && status === 'review_akhir' && (
          <div style={{ marginTop: 14 }}>
            <button type="button" className="btn" onClick={setujui} disabled={sibuk}>Setujui dan terbitkan</button>
          </div>
        )}

        {bisaReview && indeksSekarang > 0 && mode === 'biasa' && (
          <div style={{ marginTop: 14 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setMode('kembalikan'); setTujuan(STATUS_TULISAN[indeksSekarang - 1]); setPesan(''); }}
            >
              {status === 'terbit' ? 'Tarik dari terbit atau revisi' : 'Kembalikan ke status sebelumnya'}
            </button>
          </div>
        )}

        {bisaReview && mode === 'kembalikan' && (
          <div style={{ marginTop: 14 }}>
            <label htmlFor="tujuan-kembali">Kembalikan ke</label>
            <select id="tujuan-kembali" value={tujuan} onChange={(e) => setTujuan(e.target.value as StatusTulisan)}>
              {STATUS_TULISAN.slice(0, indeksSekarang).map((s) => (
                <option key={s} value={s}>{KOLOM[s].nomor} · {KOLOM[s].judul}</option>
              ))}
            </select>
            <label htmlFor="catatan-kembali">Catatan wajib (alasan revisi atau penarikan)</label>
            <textarea id="catatan-kembali" rows={4} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
            <button type="button" className="btn" onClick={kembalikan} disabled={!catatan.trim() || sibuk}>
              Kirim pengembalian
            </button>{' '}
            <button type="button" className="btn btn-ghost" onClick={() => setMode('biasa')}>Batal</button>
          </div>
        )}

        {!bisaReview && status !== 'terbit' && (
          <p className="muted" style={{ marginTop: 14 }}>Perpindahan status dilakukan lewat papan atau halaman tugasmu.</p>
        )}
        {status === 'terbit' && <p className="muted" style={{ marginTop: 14 }}>Sudah terbit dan tampil di situs.</p>}

        <div style={{ marginTop: 22 }}>
          <strong>Berkas desain</strong>
          {berkas.length === 0 ? (
            <p className="muted">Belum ada berkas.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {berkas.map((b) => (
                <li key={b.id}>
                  <a href={`/api/berkas/${b.id}`} target="_blank" rel="noopener noreferrer">{b.namaAsli}</a>{' '}
                  <span className="muted">({Math.max(1, Math.round(b.ukuran / 1024))} KB)</span>{' '}
                  <button type="button" className="btn btn-ghost at-hapus-btn" style={{ padding: '2px 10px', fontSize: 12 }} disabled={sibuk} onClick={() => hapusBerkas(b.id)}>Hapus</button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={unggah} style={{ display: 'grid', gap: 8, marginTop: 8 }}>
            <input type="hidden" name="tulisanId" value={awal.id} />
            <label htmlFor="berkas-desain">Unggah cover atau kartu (PNG, JPG, atau PDF, maksimal 10 MB). Gambar PNG/JPG terbaru menjadi sampul di situs.</label>
            <input id="berkas-desain" name="berkas" type="file" accept=".png,.jpg,.jpeg,.pdf" required />
            <button type="submit" className="btn" disabled={sibuk}>Unggah berkas</button>
          </form>
          {pesanBerkas && <p role="status" style={{ marginTop: 8 }}>{pesanBerkas}</p>}
        </div>

        {bisaReview && (
          <div className="hapus-zona">
            <h3 style={{ marginTop: 0 }}>Zona berbahaya</h3>
            {!konfirmasiHapus ? (
              <button type="button" className="btn btn-ghost at-hapus-btn" disabled={sibuk} onClick={() => setKonfirmasiHapus(true)}>Hapus tulisan permanen</button>
            ) : (
              <div className="at-hapus" role="alertdialog" aria-label="Konfirmasi hapus tulisan">
                <p><b>Hapus tulisan ini?</b> Komentar dan berkasnya ikut terhapus dan tidak bisa dikembalikan. Untuk sekadar menyembunyikan dari publik, pakai &quot;Tarik dari terbit&quot;.</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="btn at-bahaya" disabled={sibuk} onClick={hapusSemua}>Ya, hapus permanen</button>
                  <button type="button" className="btn btn-ghost" disabled={sibuk} onClick={() => setKonfirmasiHapus(false)}>Batal</button>
                </div>
              </div>
            )}
          </div>
        )}

        <p style={{ marginTop: 18 }}>
          <a href={beranda} className="kembali">← Kembali</a>
        </p>
      </aside>
    </div>
  );
}
