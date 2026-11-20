import { ImageResponse } from 'next/og';
import { and, eq } from 'drizzle-orm';
import { rubrik, tulisan } from '@/lib/db/schema';
import { dbTunggal } from '@/lib/db/tunggal';

export const alt = 'DutaDamai Sumut';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Hanya judul dan rubrik yang dibutuhkan kartu ini. Kolom lain tidak diambil.
async function ambilKartu(slug: string): Promise<{ judul: string; kategori: string } | null> {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    const [b] = await dbTunggal(url)
      .select({ judul: tulisan.judul, kategori: rubrik.nama })
      .from(tulisan)
      .innerJoin(rubrik, eq(tulisan.rubrikSlug, rubrik.slug))
      .where(and(eq(tulisan.slug, slug), eq(tulisan.status, 'terbit')));
    return b ?? null;
  } catch {
    return null;
  }
}

export default async function KartuBagikan({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await ambilKartu(slug);
  const judul = t?.judul ?? 'DutaDamai Sumut';
  const kategori = t?.kategori ?? 'Portal berita Duta Damai Sumatera Utara';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#0b1a0d',
          color: '#f2f5ec',
        }}
      >
        <div style={{ color: '#bbd540', fontSize: 30, fontWeight: 700 }}>{kategori}</div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.15 }}>{judul}</div>
        <div style={{ color: '#9aaa9c', fontSize: 28 }}>DutaDamai Sumut</div>
      </div>
    ),
    { ...size },
  );
}
