'use client';

import { useEffect, useState } from 'react';

export function BagikanTulisan({ judul }: { judul: string }) {
  const [tersalin, setTersalin] = useState(false);
  const [url, setUrl] = useState('');

  // Diisi setelah halaman di browser siap, supaya tidak berbeda dengan hasil render server.
  useEffect(() => setUrl(window.location.href), []);

  async function salin() {
    await navigator.clipboard.writeText(window.location.href);
    setTersalin(true);
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 24 }}>
      <span className="muted">Bagikan:</span>
      <a
        className="btn btn-ghost"
        href={`https://wa.me/?text=${encodeURIComponent(`${judul} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
      <button type="button" className="btn btn-ghost" onClick={salin}>
        {tersalin ? 'Tautan disalin' : 'Salin tautan'}
      </button>
    </div>
  );
}
