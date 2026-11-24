'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { DIVISI_AWAL, hitungTampil, validasiAnggota, type AnggotaTim } from '@/fitur/tim/tim';
import { hapusAnggotaAksi, tambahAnggotaAksi, ubahAnggotaAksi } from '@/fitur/tim/actions';

function inisial(nama: string) {
  const b = nama.trim().split(/\s+/);
  return ((b[0]?.[0] ?? '') + (b.length > 1 ? b[b.length - 1][0] : '')).toUpperCase();
}

export function AkunTim({ awal }: { awal: AnggotaTim[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ nama: '', peran: '', divisi: DIVISI_AWAL[0] as string });
  const [pesan, setPesan] = useState<{ teks: string; galat: boolean } | null>(null);
  const [filter, setFilter] = useState<string>('Semua');
  const [sibuk, mulai] = useTransition();

  const tampilkan = useMemo(() => (filter === 'Semua' ? awal : awal.filter((a) => a.divisi === filter)), [awal, filter]);
  const info = (teks: string) => setPesan({ teks, galat: false });
  const galat = (teks: string) => setPesan({ teks, galat: true });

  function tambah() {
    const cek = validasiAnggota(form);
    if (!cek.ok) return galat(cek.alasan);
    mulai(async () => {
      const hasil = await tambahAnggotaAksi(form);
      if (!hasil.ok) return galat(hasil.alasan);
      setForm({ nama: '', peran: '', divisi: form.divisi });
      info('Anggota ditambahkan.');
      router.refresh();
    });
  }

  return (
    <div className="at-tata">
      <aside className="card pad at-form">
        <h2>Tambah anggota</h2>
        <p className="muted">Ini daftar yang tampil di halaman Tim. Akun login dibuat terpisah lewat skrip.</p>
        <label htmlFor="tim-nama">Nama</label>
        <input id="tim-nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama lengkap" />
        <label htmlFor="tim-peran">Peran</label>
        <input id="tim-peran" value={form.peran} onChange={(e) => setForm({ ...form, peran: e.target.value })} placeholder="Penulis · Cerita Sumut" />
        <label htmlFor="tim-divisi">Divisi</label>
        <select id="tim-divisi" value={form.divisi} onChange={(e) => setForm({ ...form, divisi: e.target.value })}>
          {DIVISI_AWAL.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <button type="button" className="btn" onClick={tambah} disabled={sibuk}>Tambah anggota</button>
      </aside>

      <section aria-label="Daftar anggota">
        <div className="at-bar">
          <p className="muted" style={{ margin: 0 }}>Tampil di halaman publik: <b>{hitungTampil(awal)}</b> dari {awal.length} anggota.</p>
          <div className="at-filter" role="group" aria-label="Saring divisi">
            {['Semua', ...DIVISI_AWAL].map((d) => (
              <button key={d} type="button" className={d === filter ? 'on' : ''} aria-pressed={d === filter} onClick={() => setFilter(d)}>
                {d}
              </button>
            ))}
          </div>
        </div>
        {pesan && <div className={pesan.galat ? 'warn' : 'ok'} role="status">{pesan.teks}</div>}
        {tampilkan.length === 0 ? (
          <p className="muted">Belum ada anggota di divisi ini.</p>
        ) : (
          <div className="at-grid">
            {tampilkan.map((a, i) => (
              <KartuAnggota key={a.id} anggota={a} urutan={i} onInfo={info} onGalat={galat} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function KartuAnggota({ anggota, urutan, onInfo, onGalat }: { anggota: AnggotaTim; urutan: number; onInfo: (p: string) => void; onGalat: (p: string) => void }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [draf, setDraf] = useState({ nama: anggota.nama, peran: anggota.peran, divisi: anggota.divisi });
  const [sibuk, mulai] = useTransition();

  function simpan() {
    mulai(async () => {
      const hasil = await ubahAnggotaAksi(anggota.id, draf);
      if (!hasil.ok) return onGalat(hasil.alasan);
      setEdit(false);
      onInfo('Perubahan disimpan.');
      router.refresh();
    });
  }

  function gantiTampil() {
    mulai(async () => {
      const hasil = await ubahAnggotaAksi(anggota.id, { tampil: !anggota.tampil });
      if (!hasil.ok) return onGalat(hasil.alasan);
      onInfo(anggota.tampil ? 'Disembunyikan dari halaman Tim.' : 'Ditampilkan di halaman Tim.');
      router.refresh();
    });
  }

  function hapus() {
    mulai(async () => {
      const hasil = await hapusAnggotaAksi(anggota.id);
      if (!hasil.ok) return onGalat(hasil.alasan);
      onInfo(`${anggota.nama} dihapus dari daftar tim.`);
      router.refresh();
    });
  }

  return (
    <article className={'card pad at-kartu' + (anggota.tampil ? '' : ' redup')} style={{ ['--i' as string]: urutan }}>
      <div className="at-kepala">
        <div className="at-avatar" aria-hidden="true">{inisial(anggota.nama)}</div>
        <div style={{ minWidth: 0 }}>
          <h3>{anggota.nama}</h3>
          <div className="at-chip">
            <span>{anggota.divisi}</span>
            <span className={anggota.tampil ? 'tampil' : 'sembunyi'}>{anggota.tampil ? 'Tampil' : 'Disembunyikan'}</span>
          </div>
        </div>
      </div>

      {edit ? (
        <div className="at-edit">
          <label htmlFor={`nama-${anggota.id}`}>Nama</label>
          <input id={`nama-${anggota.id}`} value={draf.nama} onChange={(e) => setDraf({ ...draf, nama: e.target.value })} />
          <label htmlFor={`peran-${anggota.id}`}>Peran</label>
          <input id={`peran-${anggota.id}`} value={draf.peran} onChange={(e) => setDraf({ ...draf, peran: e.target.value })} />
          <label htmlFor={`divisi-${anggota.id}`}>Divisi</label>
          <select id={`divisi-${anggota.id}`} value={draf.divisi} onChange={(e) => setDraf({ ...draf, divisi: e.target.value })}>
            {DIVISI_AWAL.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="at-aksi">
            <button type="button" className="btn" onClick={simpan} disabled={sibuk}>Simpan</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setEdit(false); setDraf({ nama: anggota.nama, peran: anggota.peran, divisi: anggota.divisi }); }}>Batal</button>
          </div>
        </div>
      ) : konfirmasi ? (
        <div className="at-hapus" role="alertdialog" aria-label={`Hapus ${anggota.nama}`}>
          <p><b>Hapus {anggota.nama}?</b> Anggota hilang dari daftar tim dan tidak bisa dikembalikan. Untuk sementara, pakai Sembunyikan.</p>
          <div className="at-aksi">
            <button type="button" className="btn at-bahaya" onClick={hapus} disabled={sibuk}>Ya, hapus</button>
            <button type="button" className="btn btn-ghost" onClick={() => setKonfirmasi(false)} disabled={sibuk}>Batal</button>
          </div>
        </div>
      ) : (
        <>
          <p className="muted at-peran">{anggota.peran}</p>
          <div className="at-aksi">
            <button type="button" className="btn btn-ghost" onClick={() => setEdit(true)} disabled={sibuk}>Ubah</button>
            <button type="button" className="btn btn-ghost" onClick={gantiTampil} disabled={sibuk}>{anggota.tampil ? 'Sembunyikan' : 'Tampilkan'}</button>
            <button type="button" className="btn btn-ghost at-hapus-btn" onClick={() => setKonfirmasi(true)} disabled={sibuk}>Hapus</button>
          </div>
        </>
      )}
    </article>
  );
}
