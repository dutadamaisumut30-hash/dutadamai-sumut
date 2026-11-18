import type { ReactNode } from 'react';
import { Header } from '@/components/publik/Header';
import { Footer } from '@/components/publik/Footer';

export default function LayoutPublik({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#isi" className="sr-only">Lewati ke isi</a>
      <Header />
      <main id="isi" className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
