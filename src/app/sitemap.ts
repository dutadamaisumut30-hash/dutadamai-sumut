import type { MetadataRoute } from 'next';
import { ambilTulisanTerbit } from '@/fitur/publik/layanan';
import { dbTunggal } from '@/lib/db/tunggal';
import { rubrik } from '@/lib/db/schema';
import { urlSitus } from '@/lib/situs';

export const dynamic = 'force-dynamic';

const STATIS = ['', '/tentang', '/tim', '/karya', '/kirim-karya', '/kotak-saran', '/kontak', '/pedoman-komentar', '/kebijakan-privasi'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dasar = urlSitus();
  const hasil: MetadataRoute.Sitemap = STATIS.map((p) => ({ url: `${dasar}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.5 }));
  const url = process.env.DATABASE_URL;
  if (!url) return hasil;
  try {
    const db = dbTunggal(url);
    const [rub, tul] = await Promise.all([db.select({ slug: rubrik.slug }).from(rubrik), ambilTulisanTerbit(db)]);
    for (const r of rub) hasil.push({ url: `${dasar}/rubrik/${r.slug}`, changeFrequency: 'daily', priority: 0.6 });
    for (const t of tul) hasil.push({ url: `${dasar}/berita/${t.slug}`, changeFrequency: 'monthly', priority: 0.8 });
  } catch {
    // Jika database tidak terjangkau, sitemap tetap memuat halaman statis.
  }
  return hasil;
}
