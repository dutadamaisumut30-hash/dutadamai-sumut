import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Source_Serif_4 } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const sans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'DutaDamai Sumut', template: '%s · DutaDamai Sumut' },
  description: 'Kabar baik dan karya anak muda Sumut dari Duta Damai Sumatera Utara.',
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" data-theme="light" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
