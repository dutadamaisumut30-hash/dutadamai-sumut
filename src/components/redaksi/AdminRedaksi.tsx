'use client';

import { useState } from 'react';
import { ITEM_PAPAN_CONTOH } from '@/lib/papan-contoh';
import { AKSI, bolehAksi, PERAN, type Peran } from '@/lib/izin';
import { STATUS_TULISAN } from '@/fitur/tulisan/alur-status';
import { KOLOM } from '@/fitur/tulisan/papan';

const NAMA_PERAN: Record<Peran, string> = { publik: 'Publik', blogger: 'Blogger', dkv: 'DKV', editor: 'Editor', admin: 'Admin' };

export function AdminRedaksi() {
  const [peran, setPeran] = useState<Exclude<Peran, 'publik'>>('admin');
  const boleh = bolehAksi(peran, 'kelola_tim');

  return (
    <>
      <div className="papan-tools">
        <label htmlFor="peran-admin">Lihat sebagai</label>
        <select id="peran-admin" value={peran} onChange={(e) => setPeran(e.target.value as Exclude<Peran, 'publik'>)}>
          {PERAN.filter((p): p is Exclude<Peran, 'publik'> => p !== 'publik').map((p) => (
            <option key={p} value={p}>{NAMA_PERAN[p]}</option>
          ))}
        </select>
      </div>

      {!boleh && (
        <div className="warn" style={{ marginTop: 14 }}>Halaman ini hanya untuk Admin.</div>
      )}

      {boleh && (
        <>
          <section style={{ marginTop: 18 }}>
            <h2>Ringkasan papan</h2>
            <div className="papan-ringkas papan-ringkas-admin">
              {STATUS_TULISAN.map((s) => (
                <div key={s} className="card pad">
                  <div className="muted">{KOLOM[s].judul}</div>
                  <h2>{ITEM_PAPAN_CONTOH.filter((i) => i.status === s).length}</h2>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 22 }}>
            <h2>Matriks izin per peran</h2>
            <p className="muted">Hanya dibaca. Perubahan izin lewat keputusan tim (ADR), bukan dari halaman ini.</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="matriks-izin">
                <thead>
                  <tr>
                    <th scope="col">Aksi</th>
                    {PERAN.map((p) => <th key={p} scope="col">{NAMA_PERAN[p]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {AKSI.map((a) => (
                    <tr key={a}>
                      <th scope="row">{a}</th>
                      {PERAN.map((p) => (
                        <td key={p}>{bolehAksi(p, a) ? '✓' : '–'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
