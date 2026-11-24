import { ambilTulisanTerbit } from '@/fitur/publik/layanan';
import { dbTunggal } from '@/lib/db/tunggal';
import { urlSitus } from '@/lib/situs';

export const dynamic = 'force-dynamic';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export async function GET() {
  const dasar = urlSitus();
  const url = process.env.DATABASE_URL;
  let item = '';
  if (url) {
    try {
      const tul = (await ambilTulisanTerbit(dbTunggal(url))).slice(0, 30);
      item = tul
        .map((t) => `    <item>
      <title>${esc(t.judul)}</title>
      <link>${dasar}/berita/${t.slug}</link>
      <guid isPermaLink="true">${dasar}/berita/${t.slug}</guid>
      <category>${esc(t.rubrik)}</category>
      <description>${esc(t.ringkasan)}</description>
    </item>`)
        .join('\n');
    } catch {
      item = '';
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>DutaDamai Sumut</title>
    <link>${dasar}</link>
    <description>Kabar baik, tips skill, dan opini pelajar dari Sumatera Utara.</description>
    <language>id</language>
${item}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}
