'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { authClient } from '@/lib/auth-client';

export function KeamananAkun({ sudahAktif }: { sudahAktif: boolean }) {
  const [aktif, setAktif] = useState(sudahAktif);
  const [password, setPassword] = useState('');
  const [kode, setKode] = useState('');
  const [qr, setQr] = useState<string | null>(null);
  const [cadangan, setCadangan] = useState<string[]>([]);
  const [pesan, setPesan] = useState('');
  const [sibuk, setSibuk] = useState(false);
  const [sandiLama, setSandiLama] = useState('');
  const [sandiBaru, setSandiBaru] = useState('');
  const [pesanSandi, setPesanSandi] = useState('');
  const [sandiCadangan, setSandiCadangan] = useState('');
  const [kodeCadanganBaru, setKodeCadanganBaru] = useState<string[]>([]);
  const [pesanCadangan, setPesanCadangan] = useState('');

  async function buatUlangKodeCadangan(e: React.FormEvent) {
    e.preventDefault();
    setPesanCadangan('');
    setSibuk(true);
    const { data, error } = await authClient.twoFactor.generateBackupCodes({ password: sandiCadangan });
    setSibuk(false);
    if (error || !data) return setPesanCadangan('Kata sandi tidak cocok.');
    setSandiCadangan('');
    setKodeCadanganBaru(data.backupCodes);
  }

  async function gantiSandi(e: React.FormEvent) {
    e.preventDefault();
    setPesanSandi('');
    if (sandiBaru.length < 12) return setPesanSandi('Kata sandi baru minimal 12 karakter.');
    setSibuk(true);
    const { error } = await authClient.changePassword({ currentPassword: sandiLama, newPassword: sandiBaru, revokeOtherSessions: true });
    setSibuk(false);
    if (error) return setPesanSandi('Kata sandi lama salah atau kata sandi baru tidak memenuhi syarat.');
    setSandiLama('');
    setSandiBaru('');
    setPesanSandi('Kata sandi berhasil diganti. Sesi lain sudah dikeluarkan.');
  }

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
    <>
    <section className="card pad" style={{ maxWidth: 560 }}>
      <h2>Autentikasi dua langkah (2FA) <span className={'chip-status' + (aktif ? ' aktif' : '')}>{aktif ? 'Aktif' : 'Belum aktif'}</span></h2>

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

    {aktif && (
      <section className="card pad" style={{ maxWidth: 560, marginTop: 16 }}>
        <h2>Kode cadangan</h2>
        <p className="muted">Membuat kode baru akan membatalkan semua kode cadangan lama.</p>
        <form onSubmit={buatUlangKodeCadangan}>
          <label htmlFor="sandi-cadangan">Kata sandi</label>
          <input id="sandi-cadangan" type="password" autoComplete="current-password" value={sandiCadangan} onChange={(e) => setSandiCadangan(e.target.value)} required />
          <button type="submit" className="btn" disabled={sibuk} style={{ marginTop: 12 }}>Buat kode cadangan baru</button>
        </form>
        {pesanCadangan && <p role="alert" style={{ marginTop: 12, color: 'var(--red)' }}>{pesanCadangan}</p>}
        {kodeCadanganBaru.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong>Simpan kode ini sekarang</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{kodeCadanganBaru.join('\n')}</pre>
          </div>
        )}
      </section>
    )}

    <section className="card pad" style={{ maxWidth: 560, marginTop: 16 }}>
      <h2>Ganti kata sandi</h2>
      <form onSubmit={gantiSandi}>
        <label htmlFor="sandi-lama">Kata sandi lama</label>
        <input id="sandi-lama" type="password" autoComplete="current-password" value={sandiLama} onChange={(e) => setSandiLama(e.target.value)} required />
        <label htmlFor="sandi-baru">Kata sandi baru (minimal 12 karakter)</label>
        <input id="sandi-baru" type="password" autoComplete="new-password" value={sandiBaru} onChange={(e) => setSandiBaru(e.target.value)} required />
        <button type="submit" className="btn" disabled={sibuk} style={{ marginTop: 12 }}>Ganti kata sandi</button>
      </form>
      {pesanSandi && <p role="status" style={{ marginTop: 12 }}>{pesanSandi}</p>}
    </section>
    </>
  );
}
