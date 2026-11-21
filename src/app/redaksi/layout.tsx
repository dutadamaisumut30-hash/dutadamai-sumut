import type { ReactNode } from 'react';
import { wajibAnggotaTim } from '@/lib/sesi';
import { TombolKeluar } from '@/components/akun/TombolKeluar';

export default async function LayoutRedaksi({ children }: { children: ReactNode }) {
  const sesi = await wajibAnggotaTim();
  return (
    <>
      <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 }}>
        <span className="muted">Masuk sebagai {sesi.user.name}</span>
        <TombolKeluar />
      </div>
      {children}
    </>
  );
}
