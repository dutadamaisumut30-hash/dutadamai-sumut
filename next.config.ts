import type { NextConfig } from 'next';

const produksi = process.env.NODE_ENV === 'production';
const umami = process.env.NEXT_PUBLIC_UMAMI_URL ?? '';

// CSP hanya untuk produksi: mode pengembangan Next butuh eval dan websocket.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com ${umami}`.trim(),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://challenges.cloudflare.com ${umami}`.trim(),
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const config: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  // Batas bawaan Server Action hanya 1 MB. Berkas desain boleh sampai 10 MB, jadi diberi ruang untuk overhead form.
  // Alamat tambahan (mis. tunnel uji jarak jauh), pisahkan dengan koma. Kosongkan di produksi.
  allowedDevOrigins: (process.env.ALLOWED_DEV_ORIGINS ?? '').split(',').map((x) => x.trim()).filter(Boolean),
  experimental: {
    serverActions: {
      bodySizeLimit: '12mb',
      allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(',').map((x) => x.trim()).filter(Boolean),
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          ...(produksi
            ? [
                { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
                { key: 'Content-Security-Policy', value: csp },
              ]
            : []),
        ],
      },
    ];
  },
};

export default config;
