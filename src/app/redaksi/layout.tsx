import type { ReactNode } from 'react';
import { wajibAnggotaTim } from '@/lib/sesi';
import { bolehAksi, type Aksi, type Peran } from '@/lib/izin';
import { hitungAntrean } from '@/fitur/antrean';
import { dbTunggal } from '@/lib/db/tunggal';
import { NavRedaksi, type TabRedaksi } from '@/components/redaksi/NavRedaksi';

const NAMA_PERAN: Record<string, string> = { blogger: 'Blogger', dkv: 'DKV', editor: 'Editor', admin: 'Admin' };

// Menu hanya menampilkan halaman yang boleh dibuka perannya. Penjagaan sebenarnya tetap di wajibAksi tiap halaman.
const SEMUA_TAB: { href: string; label: string; aksi: Aksi }[] = [
  { href: '/redaksi/admin', label: 'Admin', aksi: 'kelola_tim' },
  { href: '/redaksi', label: 'Papan', aksi: 'ubah_status_review' },
  { href: '/redaksi/tulis', label: 'Tulisanku', aksi: 'tulis_draf' },
  { href: '/redaksi/dkv', label: 'Tugas DKV', aksi: 'unggah_desain' },
  { href: '/redaksi/karya-masuk', label: 'Karya masuk', aksi: 'seleksi_karya' },
  { href: '/redaksi/komentar', label: 'Komentar', aksi: 'moderasi' },
  { href: '/redaksi/laporan', label: 'Laporan', aksi: 'moderasi' },
  { href: '/redaksi/kotak-saran', label: 'Kotak saran', aksi: 'baca_kotak_saran' },
  { href: '/redaksi/rubrik', label: 'Rubrik', aksi: 'kelola_rubrik' },
  { href: '/redaksi/statistik', label: 'Statistik', aksi: 'lihat_statistik' },
  { href: '/redaksi/tim', label: 'Akun tim', aksi: 'kelola_tim' },
];

export default async function LayoutRedaksi({ children }: { children: ReactNode }) {
  const sesi = await wajibAnggotaTim();
  const peran = String(sesi.user.peran) as Peran;
  const url = process.env.DATABASE_URL;
  const a = url ? await hitungAntrean(dbTunggal(url)) : null;
  const lencana: Record<string, number | undefined> = {
    '/redaksi/komentar': a?.komentar,
    '/redaksi/laporan': a?.laporan,
    '/redaksi/kotak-saran': a?.saran,
    '/redaksi/karya-masuk': a?.karya,
    '/redaksi/dkv': a?.desain,
  };
  const tab: TabRedaksi[] = SEMUA_TAB.filter((t) => bolehAksi(peran, t.aksi)).map(({ href, label }) => ({
    href,
    label,
    lencana: lencana[href] || undefined,
  }));
  return (
    <>
      <NavRedaksi nama={sesi.user.name} peran={NAMA_PERAN[peran] ?? peran} tab={tab} />
      {children}
    </>
  );
}
