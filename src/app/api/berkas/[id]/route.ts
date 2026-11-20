import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { bolehAksi, PERAN, type Peran } from '@/lib/izin';
import { dbTunggal } from '@/lib/db/tunggal';
import { berkas } from '@/lib/db/schema';
import { bacaBerkas } from '@/lib/penyimpanan';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sesi = await auth.api.getSession({ headers: await headers() });
  const peran = sesi?.user.peran as string | null | undefined;
  if (!peran || !(PERAN as readonly string[]).includes(peran) || !bolehAksi(peran as Peran, 'unggah_desain')) {
    return new Response('Tidak diizinkan.', { status: 403 });
  }

  const url = process.env.DATABASE_URL;
  if (!url) return new Response('Server belum dikonfigurasi.', { status: 500 });

  const { id } = await params;
  try {
    const [b] = await dbTunggal(url)
      .select({ lokasi: berkas.lokasi, jenisMime: berkas.jenisMime, namaAsli: berkas.namaAsli })
      .from(berkas)
      .where(eq(berkas.id, id));
    if (!b) return new Response('Tidak ditemukan.', { status: 404 });

    const isi = await bacaBerkas(b.lokasi);
    return new Response(new Uint8Array(isi), {
      headers: {
        'Content-Type': b.jenisMime,
        'Content-Disposition': `inline; filename="${encodeURIComponent(b.namaAsli)}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return new Response('Tidak ditemukan.', { status: 404 });
  }
}
