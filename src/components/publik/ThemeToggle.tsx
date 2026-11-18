'use client';

import { useEffect, useState } from 'react';

// Default terang. Pilihan gelap disimpan di localStorage.
export function ThemeToggle() {
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    const simpanan = window.localStorage.getItem('tema') === 'gelap';
    setGelap(simpanan);
    document.documentElement.dataset.theme = simpanan ? 'dark' : 'light';
  }, []);

  function toggle() {
    const berikut = !gelap;
    setGelap(berikut);
    document.documentElement.dataset.theme = berikut ? 'dark' : 'light';
    window.localStorage.setItem('tema', berikut ? 'gelap' : 'terang');
  }

  return (
    <button type="button" className="ico" onClick={toggle} aria-pressed={gelap}>
      {gelap ? 'Mode terang' : 'Mode gelap'}
    </button>
  );
}
