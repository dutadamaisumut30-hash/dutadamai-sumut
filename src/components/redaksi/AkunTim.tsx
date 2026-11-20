'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { DIVISI_AWAL, hitungTampil, validasiAnggota, type AnggotaTim } from '@/fitur/tim/tim';
import { tambahAnggotaAksi, ubahAnggotaAksi } from '@/fitur/tim/actions';

export function AkunTim({ awal }: { awal: AnggotaTim[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ nama: '', peran: '', divisi: DIVISI_AWAL[0] as string });
  const [pesan, setPesan] = useState('');
  const [sibuk, mulai] = useTransition();

  function tambah() {
    const cek = validasiAnggota(form);
    if (!cek.ok) return setPesan(cek.alasan);
    mulai(async () => {
      const hasil = await tambahAnggotaAksi(form);
      if (!hasil.ok) return setPesan(hasil.alasan);
      setForm({ nama: '', peran: '', divisi: form.divisi });
      setPesan('Anggota ditambahkan.');
      router.refresh();
    });
  }

  return (
    <>
      <p className="muted" style={{ marginTop: 14 }}>
        Tampil di halaman publik: {hitungTampil(awal)} dari {awal.length} anggota.
      </p>
      {pesan && <div className="ok" role="status" style={{ marginBottom: 12 }}>{pesan}</div>}

      <section className="card pad" style={{ marginBottom: 18 }}>
        <h2>Tambah anggota</h2>
        <label htmlFor="tim-nama">Nama</label>
        <input id="tim-nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
        <label htmlFor="tim-peran">Peran</label>
        <input id="tim-peran" value={form.peran} onChange={(e) => setForm({ ...form, peran: e.target.value })} />
        <label htmlFor="tim-divisi">Divisi</label>
        <select id="tim-divisi" value={form.divisi} onChange={(e) => setForm({ ...form, divisi: e.target.value })}>
          {DIVISI_AWAL.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <button type="button" className="btn" onClick={tambah} disabled={sibuk} style={{ marginTop: 10 }}>Tambah</button>
      </section>

      <div style={{ display: 'grid', gap: 10 }}>
        {awal.map((a) => <KartuAnggota key={a.id} anggota={a} onPesan={setPesan} />)}
      </div>
    </>
  );
}

function KartuAnggota({ anggota, onPesan }: { anggota: AnggotaTim; onPesan: (p: string) => void }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [draf, setDraf] = useState({ peran: anggota.peran, divisi: anggota.divisi });
  const [sibuk, mulai] = useTransition();

  function simpan() {
    mulai(async () => {
      const hasil = await ubahAnggotaAksi(anggota.id, draf);
      if (!hasil.ok) return onPesan(hasil.alasan);
      setEdit(false);
      onPesan('Perubahan disimpan.');
      router.refresh();
    });
  }

  function gantiTampil() {
    mulai(async () => {
      const hasil = await ubahAnggotaAksi(anggota.id, { tampil: !anggota.tampil });
      if (!hasil.ok) return onPesan(hasil.alasan);
      onPesan(anggota.tampil ? 'Disembunyikan dari halaman Tim.' : 'Ditampilkan di halaman Tim.');
      router.refresh();
    });
  }

  return (
    <article className="card pad" style={{ opacity: anggota.tampil ? 1 : 0.6 }}>
      <div className="tagl">{anggota.divisi} · {anggota.tampil ? 'Tampil' : 'Disembunyikan'}</div>
      <p style={{ margin: '6px 0' }}><b>{anggota.nama}</b></p>
      {edit ? (
        <>
          <label htmlFor={`peran-${anggota.id}`}>Peran</label>
          <input id={`peran-${anggota.id}`} value={draf.peran} onChange={(e) => setDraf({ ...draf, peran: e.target.value })} />
          <label htmlFor={`divisi-${anggota.id}`}>Divisi</label>
          <select id={`divisi-${anggota.id}`} value={draf.divisi} onChange={(e) => setDraf({ ...draf, divisi: e.target.value })}>
            {DIVISI_AWAL.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button type="button" className="btn" onClick={simpan} disabled={sibuk}>Simpan</button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setEdit(false); setDraf({ peran: anggota.peran, divisi: anggota.divisi }); }}
            >
              Batal
            </button>
          </div>
        </>
      ) : (
        <p className="muted" style={{ margin: '6px 0' }}>{anggota.peran}</p>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {!edit && <button type="button" className="btn btn-ghost" onClick={() => setEdit(true)} disabled={sibuk}>Ubah</button>}
        <button type="button" className="btn btn-ghost" onClick={gantiTampil} disabled={sibuk}>
          {anggota.tampil ? 'Sembunyikan dari halaman Tim' : 'Tampilkan di halaman Tim'}
        </button>
      </div>
    </article>
  );
}
