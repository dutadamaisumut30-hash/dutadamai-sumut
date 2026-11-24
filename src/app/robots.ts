import type { MetadataRoute } from 'next';
import { urlSitus } from '@/lib/situs';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/redaksi', '/akun', '/masuk', '/api/'] }],
    sitemap: `${urlSitus()}/sitemap.xml`,
  };
}
