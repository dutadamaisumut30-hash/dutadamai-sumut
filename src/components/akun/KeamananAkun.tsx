'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { authClient } from '@/lib/auth-client';

export function KeamananAkun({ email, sudahAktif }: { email: string; sudahAktif: boolean }) {
  const [aktif, setAktif] = useState(sudahAktif);
  const [password, setPassword] = useState('');
  const [kode, setKode] = useState('');
  const [qr, setQr] = useState<string | null>(null);
  const [cadangan, setCadangan] = useState<string[]>([]);
  const [pesan, setPesan] = useState('');
  const [sibuk, setSibuk] = useState(false);

  async function mulai(e: React.FormEvent) {
    e.preventDefault();
    setPesan('');
    setSibuk(true);
    const { data, error } = await authClient.twoFactor.enable({ password });
    setSibuk(false);
    if (error || !data || data.method !== 'totp') return setPesan('Kata sandi tidak cocok.');
    setQr(await QRCode.toDataURL(data.totpURI));
    setCadangan(data.backupCodes);
  }

  async function konfirmasi(e: React.FormEvent) {
    e.preventDefault();
    setPesan('');
    setSibuk(true);
    const { error } = await authClient.twoFactor.verifyTotp({ code: kode });
    setSibuk(false);
    if (error) return setPesan('Kode belum cocok. Coba kode terbaru dari aplikasi.');
    setAktif(true);
    setQr(null);
    setPesan('2FA aktif. Simpan kode cadangan di password manager bersama.');
  }

  return (
    <section className="card pad" style={{ maxWidth: 560 }}>
      <p className="muted">Masuk sebagai {email}</p>
      <h2>Autentikasi dua langkah (2FA)</h2>

      {aktif && !qr && <p>2FA sudah aktif untuk akunmu.</p>}

      {!aktif && !qr && (
        <form onSubmit={mulai}>
          <p>Aktifkan 2FA dengan aplikasi authenticator (misalnya Google Authenticator). Masukkan kata sandimu untuk memulai.</p>
          <label htmlFor="sandi-2fa">Kata sandi</label>
          <input id="sandi-2fa" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="btn" disabled={sibuk} style={{ marginTop: 12 }}>Mulai aktivasi</button>
        </form>
      )}

      {qr && (
        <form onSubmit={konfirmasi}>
          <p>Pindai QR ini dengan aplikasi authenticator, lalu masukkan kode 6 digit.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR kode 2FA" width={220} height={220} />
          <label htmlFor="kode-aktivasi">Kode 6 digit</label>
          <input id="kode-aktivasi" inputMode="numeric" autoComplete="one-time-code" value={kode} onChange={(e) => setKode(e.target.value)} required />
          <button type="submit" className="btn" disabled={sibuk} style={{ marginTop: 12 }}>Konfirmasi</button>
          <div style={{ marginTop: 16 }}>
            <strong>Kode cadangan</strong>
            <p className="muted">Dipakai jika HP hilang. Setiap kode hanya bisa dipakai sekali.</p>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{cadangan.join('\n')}</pre>
          </div>
        </form>
      )}

      {pesan && <p role="status" style={{ marginTop: 12 }}>{pesan}</p>}
    </section>
  );
}
