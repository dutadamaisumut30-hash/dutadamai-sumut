import type { ReactNode } from 'react';
import { Header } from '@/components/publik/Header';
import { Footer } from '@/components/publik/Footer';
import { BilahProgres } from '@/components/publik/BilahProgres';
import { EfekScroll } from '@/components/publik/EfekScroll';
import '@/components/publik/efek.css';

export default function LayoutPublik({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#isi" className="sr-only">Lewati ke isi</a>
      <BilahProgres />
      <EfekScroll />
      <Header />
      <main id="isi" className="wrap" style={{ paddingTop: 24, paddingBottom: 48 }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
