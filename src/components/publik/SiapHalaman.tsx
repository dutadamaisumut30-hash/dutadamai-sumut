'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __halamanSiap?: number;
  }
}

// Efeknya berjalan setelah React selesai menghidrasi halaman. Mengubah gaya elemen sebelum itu
// membuat HTML server dan klien tidak cocok. Komponen ini ada di template, jadi berbunyi di setiap halaman.
export function SiapHalaman() {
  useEffect(() => {
    window.__halamanSiap = (window.__halamanSiap ?? 0) + 1;
    window.dispatchEvent(new Event('halaman-siap'));
  }, []);
  return null;
}
