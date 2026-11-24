// Alamat dasar situs untuk sitemap, RSS, dan tautan kanonik. Atur NEXT_PUBLIC_SITE_URL di produksi (ADR 003).
export function urlSitus(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}
