'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { kirimKarya } from '@/fitur/karya/actions';
import { pesanBerkasTerlaluBesar } from '@/fitur/karya/kirim';

type Jenis = 'tulisan' | 'desain';

export function KirimForm() {
  const router = useRouter();
  const [langkah, setLangkah] = useState<1 | 2 | 3>(1);
  const [jenis, setJenis] = useState<Jenis>('tulisan');
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [berkasNama, setBerkasNama] = useState('');
  const [berkasPesan, setBerkasPesan] = useState<string | null>(null);
  const [namaPanggung, setNamaPanggung] = useState('');
  const [kontak, setKontak] = useState('');
  const [buatanSendiri, setBuatanSendiri] = useState(false);
  const [orangTuaTahu, setOrangTuaTahu] = useState(false);
  const [tampilkanIdentitas, setTampilkanIdentitas] = useState(false);
  const [sekolah, setSekolah] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [err, setErr] = useState('');
  const [pending, startTransition] = useTransition();

  function lanjutKe2() {
    setErr('');
    if (!judul.trim()) return setErr('Judul wajib diisi.');
    if (jenis === 'tulisan' && !isi.trim()) return setErr('Isi tulisan wajib diisi.');
    if (jenis === 'desain' && !berkasNama) return setErr('Unggah berkas desainmu dulu.');
    setLangkah(3);
  }

  function kirim() {
    setErr('');
    if (!namaPanggung.trim()) return setErr('Nama panggung wajib diisi.');
    if (kontak.trim().length < 3) return setErr('Kontak wajib diisi, supaya redaksi bisa menghubungimu.');
    if (!buatanSendiri) return setErr('Centang bahwa karya ini buatan sendiri.');

    startTransition(async () => {
      const hasil = await kirimKarya({
        jenis,
        judul,
        isi,
        namaPanggung,
        kontak,
        buatanSendiri: true,
        orangTuaTahu,
        tampilkanIdentitas,
        sekolah: tampilkanIdentitas ? sekolah : undefined,
        namaLengkap: tampilkanIdentitas ? namaLengkap : undefined,
      });
      if (hasil.ok) {
        router.push(`/kirim-karya/lacak/${hasil.kode}`);
      } else {
        setErr(hasil.pesan);
      }
    });
  }

  return (
    <div className="narrow">
      <div className="steps" aria-label={`Langkah ${langkah} dari 3`}>
        <span className="on" />
        <span className={langkah >= 2 ? 'on' : ''} />
        <span className={langkah >= 3 ? 'on' : ''} />
      </div>

      {langkah === 1 && (
        <section>
          <h2>1. Jenis karya</h2>
          <button type="button" className={`opt ${jenis === 'tulisan' ? 'on' : ''}`} onClick={() => setJenis('tulisan')}>
            <b>Tulisan</b>
            <div className="muted">Opini, cerpen, puisi, atau liputan kecil</div>
          </button>
          <button type="button" className={`opt ${jenis === 'desain' ? 'on' : ''}`} onClick={() => setJenis('desain')}>
            <b>Desain</b>
            <div className="muted">Poster, ilustrasi, atau infografis</div>
          </button>
          <button type="button" className="btn" onClick={() => setLangkah(2)}>Lanjut</button>
        </section>
      )}

      {langkah === 2 && (
        <section>
          <h2>2. Isi karya</h2>
          <label htmlFor="judul">Judul</label>
          <input id="judul" value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Judul karyamu" maxLength={150} />
          {jenis === 'tulisan' ? (
            <>
              <label htmlFor="isi">Isi tulisan</label>
              <textarea id="isi" rows={8} value={isi} onChange={(e) => setIsi(e.target.value)} placeholder="Tulis isinya di sini" />
            </>
          ) : (
            <>
              <label htmlFor="berkas">Berkas desain (JPG atau PNG, maks. 5 MB)</label>
              <input
                id="berkas"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setBerkasNama(f?.name ?? '');
                  setBerkasPesan(f ? pesanBerkasTerlaluBesar(f.size) : null);
                }}
              />
              {berkasPesan && <div className="err">{berkasPesan}</div>}
              <p className="muted">Berkas belum dikirim ke server. Penyimpanan berkas menunggu tahap backend.</p>
            </>
          )}
          <div className="err">{err}</div>
          <button type="button" className="btn btn-ghost" onClick={() => setLangkah(1)}>Kembali</button>{' '}
          <button type="button" className="btn" onClick={lanjutKe2} disabled={!!berkasPesan}>Lanjut</button>
        </section>
      )}

      {langkah === 3 && (
        <section>
          <h2>3. Tentang kamu</h2>
          <label htmlFor="panggung">Nama panggung</label>
          <input id="panggung" value={namaPanggung} onChange={(e) => setNamaPanggung(e.target.value)} placeholder="Misalnya: anakmedan" maxLength={50} />
          <label htmlFor="kontak">Kontak (email atau WhatsApp, tidak ditampilkan ke publik)</label>
          <input id="kontak" value={kontak} onChange={(e) => setKontak(e.target.value)} placeholder="Hanya untuk redaksi" maxLength={120} />

          <label className="chk">
            <input type="checkbox" checked={buatanSendiri} onChange={(e) => setBuatanSendiri(e.target.checked)} />
            Karya ini buatan sendiri (wajib)
          </label>
          <label className="chk">
            <input type="checkbox" checked={orangTuaTahu} onChange={(e) => setOrangTuaTahu(e.target.checked)} />
            Orang tua atau wali tahu, bila saya di bawah 18 tahun
          </label>
          <label className="chk">
            <input type="checkbox" checked={tampilkanIdentitas} onChange={(e) => setTampilkanIdentitas(e.target.checked)} />
            Tampilkan sekolah dan nama lengkap (opsional)
          </label>
          {tampilkanIdentitas && (
            <>
              <label htmlFor="sekolah">Sekolah</label>
              <input id="sekolah" value={sekolah} onChange={(e) => setSekolah(e.target.value)} maxLength={100} />
              <label htmlFor="nama">Nama lengkap</label>
              <input id="nama" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} maxLength={100} />
            </>
          )}

          <div className="err">{err}</div>
          <button type="button" className="btn btn-ghost" onClick={() => setLangkah(2)}>Kembali</button>{' '}
          <button type="button" className="btn" onClick={kirim} disabled={pending}>
            {pending ? 'Mengirim…' : 'Kirim karya'}
          </button>
        </section>
      )}
    </div>
  );
}
