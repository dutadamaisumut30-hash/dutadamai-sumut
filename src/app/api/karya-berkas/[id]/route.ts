import { and, eq } from 'drizzle-orm';
import { berkas, karya } from '@/lib/db/schema';
import { dbTunggal } from '@/lib/db/tunggal';
import { urlDbWajib } from '@/lib/db/url';
import { bacaBerkas } from '@/lib/penyimpanan';

// Gambar desain karya yang sudah terbit. Berkas karya yang belum terbit tidak pernah bisa diakses dari sini.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('Tidak ditemukan.', { status: 404 });

  try {
    const [b] = await dbTunggal(urlDbWajib())
      .select({ lokasi: berkas.lokasi, jenisMime: berkas.jenisMime })
      .from(berkas)
      .innerJoin(karya, eq(berkas.karyaId, karya.id))
      .where(and(eq(berkas.id, id), eq(karya.tahap, 'terbit')));
    if (!b) return new Response('Tidak ditemukan.', { status: 404 });

    const isi = await bacaBerkas(b.lokasi);
    return new Response(new Uint8Array(isi), {
      headers: {
        'Content-Type': b.jenisMime,
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Tidak ditemukan.', { status: 404 });
  }
}
