'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { kirimKarya } from '@/fitur/karya/actions';
import { pesanBerkasTerlaluBesar } from '@/fitur/karya/kirim';
import { BACKEND_SIAP, PESAN_BELUM_TERSAMBUNG } from '@/lib/status-sistem';
import { KeteranganVerifikasi, Turnstile } from './Turnstile';

type Jenis = 'tulisan' | 'desain';
type BerkasInfo = { nama: string; tipe: string; ukuranByte: number };

export function KirimForm() {
  const router = useRouter();
  const [langkah, setLangkah] = useState<1 | 2 | 3>(1);
  const [jenis, setJenis] = useState<Jenis>('tulisan');
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [berkas, setBerkas] = useState<BerkasInfo | null>(null);
  const [berkasFile, setBerkasFile] = useState<File | null>(null);
  const [berkasPesan, setBerkasPesan] = useState<string | null>(null);
  const [namaPanggung, setNamaPanggung] = useState('');
  const [kontak, setKontak] = useState('');
  const [buatanSendiri, setBuatanSendiri] = useState(false);
  const [dibawahUmur18, setDibawahUmur18] = useState(false);
  const [orangTuaTahu, setOrangTuaTahu] = useState(false);
  const [tampilkanIdentitas, setTampilkanIdentitas] = useState(false);
  const [sekolah, setSekolah] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [err, setErr] = useState('');
  const [turnstile, setTurnstile] = useState('');
  const [pending, startTransition] = useTransition();

  function lanjutKe2() {
    setErr('');
    if (!judul.trim()) return setErr('Judul wajib diisi.');
    if (jenis === 'tulisan' && !isi.trim()) return setErr('Isi tulisan wajib diisi.');
    if (jenis === 'desain' && !berkas) return setErr('Unggah berkas desainmu dulu.');
    setLangkah(3);
  }

  function kirim() {
    setErr('');
    if (!namaPanggung.trim()) return setErr('Nama panggung wajib diisi.');
    if (kontak.trim().length < 3) return setErr('Kontak wajib diisi, supaya redaksi bisa menghubungimu.');
    if (!buatanSendiri) return setErr('Centang bahwa karya ini buatan sendiri.');
    if (dibawahUmur18 && !orangTuaTahu) {
      return setErr('Karya dari peserta di bawah 18 tahun wajib disetujui orang tua atau wali.');
    }

    startTransition(async () => {
      const data = {
        jenis,
        judul,
        isi,
        berkas: jenis === 'desain' ? berkas ?? undefined : undefined,
        namaPanggung,
        kontak,
        buatanSendiri: true,
        dibawahUmur18,
        orangTuaTahu,
        tampilkanIdentitas,
        sekolah: tampilkanIdentitas ? sekolah : undefined,
        namaLengkap: tampilkanIdentitas ? namaLengkap : undefined,
      };
      const fd = new FormData();
      fd.set('data', JSON.stringify(data));
      if (jenis === 'desain' && berkasFile) fd.set('berkas', berkasFile);
      fd.set('turnstile', turnstile);
      const hasil = await kirimKarya(fd);
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
              <textarea id="isi" rows={8} value={isi} onChange={(e) => setIsi(e.target.value)} placeholder="Tulis isinya di sini" maxLength={20000} />
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
                  setBerkas(f ? { nama: f.name, tipe: f.type, ukuranByte: f.size } : null);
                  setBerkasFile(f ?? null);
                  setBerkasPesan(f ? pesanBerkasTerlaluBesar(f.size) : null);
                }}
              />
              {berkasPesan && <div className="err">{berkasPesan}</div>}
              <p className="muted">Berkas dikirim bersama formulir saat kamu menekan Kirim karya.</p>
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
            <input type="checkbox" checked={dibawahUmur18} onChange={(e) => { setDibawahUmur18(e.target.checked); if (!e.target.checked) setOrangTuaTahu(false); }} />
            Saya di bawah 18 tahun
          </label>
          {dibawahUmur18 && (
            <label className="chk">
              <input type="checkbox" checked={orangTuaTahu} onChange={(e) => setOrangTuaTahu(e.target.checked)} />
              Orang tua atau wali tahu dan menyetujui karya ini dikirim (wajib)
            </label>
          )}
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

          {!BACKEND_SIAP && <div className="warn">{PESAN_BELUM_TERSAMBUNG}</div>}
          <Turnstile onToken={setTurnstile} />
      <KeteranganVerifikasi token={turnstile} sibuk={pending} />
          <div className="err">{err}</div>
          <button type="button" className="btn btn-ghost" onClick={() => setLangkah(2)}>Kembali</button>{' '}
          <button type="button" className="btn" onClick={kirim} disabled={pending || !BACKEND_SIAP || !turnstile}>
            {pending ? 'Mengirim…' : 'Kirim karya'}
          </button>
        </section>
      )}
    </div>
  );
}
