import { DIVISI_AWAL, kelompokkanPublik } from '@/fitur/tim/tim';
import { ambilAnggotaTampil } from '@/fitur/tim/layanan';
import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';

export const metadata = { title: 'Tim' };
export const dynamic = 'force-dynamic';

// Daftar tampil diatur di menu Akun tim (admin). Konfirmasi nama sebelum rilis.
export default async function HalamanTim() {
  const anggota = await ambilAnggotaTampil(dbTunggal(urlDbWajib()));
  const kelompok = kelompokkanPublik(anggota, DIVISI_AWAL);
  return (
    <section>
      <div className="kicker">Di balik website</div>
      <h1>Tim</h1>
      <p className="muted">Tiga divisi, satu redaksi. Hanya anggota yang setuju yang profilnya tampil.</p>
      {kelompok.map((k) => (
        <div key={k.divisi}>
          <h2 style={{ marginTop: 22 }}>{k.divisi}</h2>
          <div className="card pad">
            {k.anggota.map((a) => (
              <p key={a.id} style={{ margin: '6px 0' }}><b>{a.nama}</b> · {a.peran}</p>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
