import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FormMasuk } from '@/components/akun/FormMasuk';
import { auth } from '@/lib/auth';
import { berandaRedaksi } from '@/lib/sesi';

export const metadata = { title: 'Masuk tim', robots: { index: false, follow: false } };

export default async function HalamanMasuk() {
  // Sudah masuk: langsung ke ruang kerja sesuai peran.
  const sesi = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  const peran = sesi?.user.peran as string | undefined;
  if (sesi && peran && peran !== 'publik') redirect(berandaRedaksi(peran));
  return (
    <main className="halaman-tengah">
      <div className="kicker">Ruang tim</div>
      <h1>Masuk</h1>
      <p className="muted">Khusus anggota tim redaksi. Akun dibuat oleh Admin.</p>
      <FormMasuk />
      <p style={{ marginTop: 16 }}><Link href="/" className="kembali">← Kembali ke beranda</Link></p>
    </main>
  );
}
