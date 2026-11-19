'use client';

import { useState } from 'react';
import { bolehAksi, PERAN, type Peran } from '@/lib/izin';
import { DIVISI_AWAL, hitungTampil, TIM_CONTOH, validasiAnggota, type AnggotaTim } from '@/fitur/tim/tim';

const NAMA_PERAN: Record<Peran, string> = { publik: 'Publik', blogger: 'Blogger', dkv: 'DKV', editor: 'Editor', admin: 'Admin' };

export function AkunTim() {
  const [peran, setPeran] = useState<Exclude<Peran, 'publik'>>('admin');
  const [anggota, setAnggota] = useState<AnggotaTim[]>(TIM_CONTOH);
  const [pesan, setPesan] = useState('');
  const [form, setForm] = useState({ nama: '', peran: '', divisi: DIVISI_AWAL[0] as string });
  const boleh = bolehAksi(peran, 'kelola_tim');

  function tambah() {
    const hasil = validasiAnggota(form);
    if (!hasil.ok) return setPesan(hasil.alasan);
    setAnggota((prev) => [...prev, { id: `t${Date.now()}`, nama: form.nama.trim(), peran: form.peran.trim(), divisi: form.divisi, tampil: true }]);
    setForm({ nama: '', peran: '', divisi: form.divisi });
    setPesan('Anggota ditambahkan (pratinjau, belum tersimpan ke database).');
  }

  function ubah(id: string, patch: Partial<AnggotaTim>) {
    setAnggota((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    setPesan('');
  }

  return (
    <>
      <div className="papan-tools">
        <label htmlFor="peran-tim">Lihat sebagai</label>
        <select id="peran-tim" value={peran} onChange={(e) => { setPeran(e.target.value as Exclude<Peran, 'publik'>); setPesan(''); }}>
          {PERAN.filter((p): p is Exclude<Peran, 'publik'> => p !== 'publik').map((p) => (
            <option key={p} value={p}>{NAMA_PERAN[p]}</option>
          ))}
        </select>
      </div>

      {!boleh && <div className="warn" style={{ marginTop: 14 }}>Akun tim hanya bisa dikelola Admin.</div>}

      {boleh && (
        <>
          <p className="muted" style={{ marginTop: 14 }}>
            Tampil di halaman publik: {hitungTampil(anggota)} dari {anggota.length} anggota.
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
            <button type="button" className="btn" onClick={tambah} style={{ marginTop: 10 }}>Tambah</button>
          </section>

          <div style={{ display: 'grid', gap: 10 }}>
            {anggota.map((a) => (
              <article key={a.id} className="card pad" style={{ opacity: a.tampil ? 1 : 0.6 }}>
                <div className="tagl">{a.divisi} · {a.tampil ? 'Tampil' : 'Disembunyikan'}</div>
                <p style={{ margin: '6px 0' }}><b>{a.nama}</b></p>
                <label htmlFor={`peran-${a.id}`}>Peran</label>
                <input id={`peran-${a.id}`} value={a.peran} onChange={(e) => ubah(a.id, { peran: e.target.value })} />
                <label htmlFor={`divisi-${a.id}`}>Divisi</label>
                <select id={`divisi-${a.id}`} value={a.divisi} onChange={(e) => ubah(a.id, { divisi: e.target.value })}>
                  {DIVISI_AWAL.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <div style={{ marginTop: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => ubah(a.id, { tampil: !a.tampil })}>
                    {a.tampil ? 'Sembunyikan dari halaman Tim' : 'Tampilkan di halaman Tim'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
