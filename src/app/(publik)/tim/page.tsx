import { DIVISI_AWAL, kelompokkanPublik } from '@/fitur/tim/tim';
import { ambilAnggotaTampil } from '@/fitur/tim/layanan';
import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';
import './tim.css';

export const metadata = { title: 'Tim' };
export const dynamic = 'force-dynamic';

const KETERANGAN: Record<string, string> = {
  Blogger: 'Menulis cerita dan opini dari lapangan.',
  Editor: 'Menyeleksi, menyunting, dan menjaga ruang komentar.',
  DKV: 'Merancang cover, ilustrasi, dan kartu bagikan.',
  IT: 'Membangun dan merawat website ini.',
};

function inisial(nama: string) {
  const bagian = nama.trim().split(/\s+/);
  return ((bagian[0]?.[0] ?? '') + (bagian.length > 1 ? bagian[bagian.length - 1][0] : '')).toUpperCase();
}

// Peran disimpan sebagai "Jabatan · detail". Jabatan jadi judul kecil, detail jadi keterangan.
function pecahPeran(peran: string) {
  const [jabatan, ...sisa] = peran.split(' · ');
  return { jabatan, detail: sisa.join(' · ') };
}

// Daftar tampil diatur di menu Akun tim (admin). Konfirmasi nama sebelum rilis.
export default async function HalamanTim() {
  const anggota = await ambilAnggotaTampil(dbTunggal(urlDbWajib()));
  const kelompok = kelompokkanPublik(anggota, DIVISI_AWAL);
  return (
    <section>
      <div className="tim-hero">
        <div className="kicker">Di balik website</div>
        <h1>Tim</h1>
        <p className="muted">Empat divisi, satu redaksi. Hanya anggota yang setuju yang profilnya tampil.</p>
        <ul className="tim-chip" aria-label="Divisi">
          {kelompok.map((k) => (
            <li key={k.divisi}><a href={`#divisi-${k.divisi}`}>{k.divisi} <span>{k.anggota.length}</span></a></li>
          ))}
        </ul>
      </div>

      {kelompok.map((k) => (
        <div key={k.divisi} id={`divisi-${k.divisi}`} className="tim-divisi" data-divisi={k.divisi}>
          <div className="sec">
            <h2>{k.divisi}</h2>
            <span className="muted">{KETERANGAN[k.divisi] ?? ''}</span>
          </div>
          <div className="grid3">
            {k.anggota.map((a) => {
              const { jabatan, detail } = pecahPeran(a.peran);
              return (
                <article key={a.id} className="card pad anggota">
                  <div className="avatar" aria-hidden="true">{inisial(a.nama)}</div>
                  <div>
                    <h3>{a.nama}</h3>
                    <p className="jabatan">{jabatan}</p>
                    {detail && <p className="muted">{detail}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
