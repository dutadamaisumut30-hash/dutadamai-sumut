import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

/** Koneksi PostgreSQL untuk server. URL dari DATABASE_URL (lihat .env.example). */
export function buatDb(url: string) {
  const pool = new Pool({ connectionString: url });
  return drizzle(pool, { schema });
}
