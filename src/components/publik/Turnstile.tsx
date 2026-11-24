'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

// Widget Cloudflare Turnstile. Token diberikan lewat onToken, dan dikosongkan saat kedaluwarsa.
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [diblokir, setDiblokir] = useState(false);

  // Jika skrip Cloudflare tidak termuat (pemblokir iklan, Brave Shields, jaringan), beri tahu pengunjung.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!(window as unknown as { turnstile?: unknown }).turnstile) {
        setDiblokir(true);
        // Kunci uji Cloudflare (1x0000...) menerima token apa pun. Hanya untuk pengembangan lokal, tidak berlaku dengan kunci asli.
        if (siteKey?.startsWith('1x00000000')) onToken('lewati-mode-uji');
      }
    }, 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.ddTurnstileOk = (token: string) => onToken(token);
    w.ddTurnstileHabis = () => onToken('');
    return () => {
      delete w.ddTurnstileOk;
      delete w.ddTurnstileHabis;
    };
  }, [onToken]);

  if (!siteKey) {
    return <div className="warn">Verifikasi keamanan belum dikonfigurasi, jadi formulir belum bisa dikirim.</div>;
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-callback="ddTurnstileOk"
        data-expired-callback="ddTurnstileHabis"
        data-error-callback="ddTurnstileHabis"
      />
      {diblokir && (
        <div className="warn" role="status">
          {siteKey?.startsWith('1x00000000')
            ? 'Mode uji: pemblokir (mis. Brave Shields) menahan widget Cloudflare, jadi verifikasi dilewati otomatis. Dengan kunci asli hal ini tidak berlaku.'
            : 'Verifikasi keamanan tidak termuat. Matikan pemblokir iklan atau Brave Shields untuk situs ini, lalu muat ulang halaman.'}
        </div>
      )}
    </>
  );
}

/** Keterangan di dekat tombol kirim: menjelaskan kenapa tombol belum aktif. */
export function KeteranganVerifikasi({ token, sibuk }: { token: string; sibuk?: boolean }) {
  if (sibuk) return <p className="muted ver-ket" role="status">Mengirim…</p>;
  if (token) return <p className="ver-ket ver-ok" role="status">✓ Verifikasi keamanan selesai</p>;
  return <p className="muted ver-ket" role="status">Menunggu verifikasi keamanan… tombol kirim aktif setelah selesai.</p>;
}
