'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Bilah tipis di atas layar: muncul saat tautan internal diklik, hilang saat halaman baru tampil.
export function BilahProgres() {
  const path = usePathname();
  const [jalan, setJalan] = useState(false);

  useEffect(() => {
    setJalan(false);
  }, [path]);

  useEffect(() => {
    function onKlik(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      setJalan(true);
    }
    document.addEventListener('click', onKlik);
    return () => document.removeEventListener('click', onKlik);
  }, []);

  return <div className={'progres' + (jalan ? ' jalan' : '')} role="progressbar" aria-hidden={!jalan} aria-label="Memuat halaman" />;
}
