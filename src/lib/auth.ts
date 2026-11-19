// Instance Better Auth untuk aplikasi. Dibaca juga oleh CLI schema (generate).
import * as schema from '@/lib/db/schema';
import { buatDb } from '@/lib/db';
import { buatAuth } from '@/lib/auth/konfigurasi';

const url = process.env.DATABASE_URL ?? 'postgres://dutadamai:dutadamai@localhost:5433/dutadamai';

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('BETTER_AUTH_SECRET wajib diisi di produksi.');
}

export const auth = buatAuth({
  db: buatDb(url),
  schema,
  secret: secret ?? 'pengembangan-saja-jangan-dipakai-di-produksi-0123',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
});
