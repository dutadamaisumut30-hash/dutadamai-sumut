'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export function FormMasuk() {
  const [tahap, setTahap] = useState<'login' | 'kode'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kode, setKode] = useState('');
  const [pesan, setPesan] = useState('');
  const [sibuk, setSibuk] = useState(false);

  async function masuk(e: React.FormEvent) {
    e.preventDefault();
    setPesan('');
    setSibuk(true);
    const { data, error } = await authClient.signIn.email({ email, password });
    setSibuk(false);
    if (error) return setPesan('Email atau kata sandi salah.');
    if ((data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) return setTahap('kode');
    window.location.href = '/akun/keamanan';
  }

  async function verifikasi(e: React.FormEvent) {
    e.preventDefault();
    setPesan('');
    setSibuk(true);
    const { error } = await authClient.twoFactor.verifyTotp({ code: kode });
    setSibuk(false);
    if (error) return setPesan('Kode tidak valid. Periksa aplikasi authenticator kamu.');
    window.location.href = '/akun/keamanan';
  }

  if (tahap === 'kode') {
    return (
      <form onSubmit={verifikasi} className="card pad" style={{ maxWidth: 420 }}>
        <p>Masukkan kode 6 digit dari aplikasi authenticator.</p>
        <label htmlFor="kode-2fa">Kode 2FA</label>
        <input id="kode-2fa" inputMode="numeric" autoComplete="one-time-code" value={kode} onChange={(e) => setKode(e.target.value)} required />
        {pesan && <p role="alert" style={{ color: 'var(--red)' }}>{pesan}</p>}
        <button type="submit" className="btn" disabled={sibuk} style={{ marginTop: 12 }}>Verifikasi</button>
      </form>
    );
  }

  return (
    <form onSubmit={masuk} className="card pad" style={{ maxWidth: 420 }}>
      <label htmlFor="email-masuk">Email</label>
      <input id="email-masuk" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <label htmlFor="sandi-masuk">Kata sandi</label>
      <input id="sandi-masuk" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {pesan && <p role="alert" style={{ color: 'var(--red)' }}>{pesan}</p>}
      <button type="submit" className="btn" disabled={sibuk} style={{ marginTop: 12 }}>Masuk</button>
    </form>
  );
}
