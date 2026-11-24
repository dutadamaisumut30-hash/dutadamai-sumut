import type { ReactNode } from 'react';
import Script from 'next/script';
import { Header } from '@/components/publik/Header';
import { Footer } from '@/components/publik/Footer';
import { BilahProgres } from '@/components/publik/BilahProgres';
import { EfekScroll } from '@/components/publik/EfekScroll';
import '@/components/publik/efek.css';

export default function LayoutPublik({ children }: { children: ReactNode }) {
  return (
    <>
      {process.env.NEXT_PUBLIC_UMAMI_URL && process.env.NEXT_PUBLIC_UMAMI_ID && (
        <Script defer src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`} data-website-id={process.env.NEXT_PUBLIC_UMAMI_ID} strategy="afterInteractive" />
      )}
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
