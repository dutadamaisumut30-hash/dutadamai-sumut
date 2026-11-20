'use client';

import { useEffect } from 'react';
import Script from 'next/script';

// Widget Cloudflare Turnstile. Token diberikan lewat onToken, dan dikosongkan saat kedaluwarsa.
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

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
    </>
  );
}
