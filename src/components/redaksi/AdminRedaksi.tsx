'use client';

import { AKSI, bolehAksi, PERAN, type Peran } from '@/lib/izin';
import { STATUS_TULISAN, type StatusTulisan } from '@/fitur/tulisan/alur-status';
import { KOLOM } from '@/fitur/tulisan/papan';

const NAMA_PERAN: Record<Peran, string> = { publik: 'Publik', blogger: 'Blogger', dkv: 'DKV', editor: 'Editor', admin: 'Admin' };

// Halaman ini hanya bisa dibuka Admin (dijaga di server). Peran yang dipakai adalah peran akun yang login.
export function AdminRedaksi({ jumlah }: { jumlah: Record<StatusTulisan, number> }) {
  return (
    <>
      <section style={{ marginTop: 18 }}>
        <h2>Ringkasan papan</h2>
        <div className="papan-ringkas papan-ringkas-admin">
          {STATUS_TULISAN.map((s) => (
            <div key={s} className="card pad">
              <div className="muted">{KOLOM[s].judul}</div>
              <h2>{jumlah[s]}</h2>
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
  );
}
