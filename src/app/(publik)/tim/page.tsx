import { TIM_CONTOH, DIVISI_AWAL, kelompokkanPublik } from '@/fitur/tim/tim';

export const metadata = { title: 'Tim' };

// Daftar tampil diatur di menu Akun tim (admin). Konfirmasi nama sebelum rilis.
export default function HalamanTim() {
  const kelompok = kelompokkanPublik(TIM_CONTOH, DIVISI_AWAL);
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
