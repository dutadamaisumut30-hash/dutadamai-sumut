import { dbTunggal } from '@/lib/db/tunggal';
import { ambilSampul } from '@/fitur/berkas/layanan';
import { bacaBerkas } from '@/lib/penyimpanan';

// Sampul publik: hanya gambar (PNG/JPG) milik tulisan yang sudah terbit. PDF dan tulisan belum terbit tidak pernah keluar dari sini.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const url = process.env.DATABASE_URL;
  if (!url) return new Response('Tidak ditemukan.', { status: 404 });
  const { slug } = await params;
  try {
    const s = await ambilSampul(dbTunggal(url), slug);
    if (!s) return new Response('Tidak ditemukan.', { status: 404 });
    const isi = await bacaBerkas(s.lokasi);
    return new Response(new Uint8Array(isi), {
      headers: { 'Content-Type': s.jenisMime, 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch {
    return new Response('Tidak ditemukan.', { status: 404 });
  }
}
