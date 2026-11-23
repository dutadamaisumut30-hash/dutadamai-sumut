import type { ReactNode } from 'react';
import { SiapHalaman } from '@/components/publik/SiapHalaman';

// template.tsx dibuat ulang tiap pindah halaman, jadi animasi masuk ini berjalan di setiap navigasi.
// Header dan footer ada di layout, jadi tidak ikut beranimasi.
export default function TemplatePublik({ children }: { children: ReactNode }) {
  return (
    <div className="halaman-masuk">
      <SiapHalaman />
      {children}
    </div>
  );
}
