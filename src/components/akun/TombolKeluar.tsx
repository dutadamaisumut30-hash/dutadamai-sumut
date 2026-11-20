'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function TombolKeluar() {
  const router = useRouter();

  async function keluar() {
    await authClient.signOut();
    router.push('/masuk');
    router.refresh();
  }

  return (
    <button type="button" className="btn btn-ghost" onClick={keluar}>
      Keluar
    </button>
  );
}
