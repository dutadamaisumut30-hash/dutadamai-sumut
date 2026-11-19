import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { beforeAll, describe, expect, it } from 'vitest';
import * as s from '@/lib/db/schema';
import { buatAuth } from '@/lib/auth/konfigurasi';

describe('login Better Auth di PGlite', () => {
  let auth: ReturnType<typeof buatAuth>;
  let db: ReturnType<typeof drizzle<typeof s>>;

  beforeAll(async () => {
    db = drizzle(new PGlite(), { schema: s });
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
    auth = buatAuth({
      db,
      schema: s as unknown as Record<string, unknown>,
      secret: 'tes-rahasia-minimal-32-karakter-aman-0123456789',
      baseURL: 'http://localhost:3000',
    });
  });

  it('mendaftarkan akun dengan kata sandi minimal 12 karakter', async () => {
    await expect(auth.api.signUpEmail({
      body: { email: 'pendek@duta.test', password: 'pendek', name: 'Pendek' },
    })).rejects.toThrow();

    const hasil = await auth.api.signUpEmail({
      body: { email: 'editor@duta.test', password: 'kata-sandi-panjang-1', name: 'Putri Lubis' },
    });
    expect(hasil.user.email).toBe('editor@duta.test');
  });

  it('login dengan kata sandi yang benar berhasil', async () => {
    const hasil = await auth.api.signInEmail({
      body: { email: 'editor@duta.test', password: 'kata-sandi-panjang-1' },
    });
    expect(hasil.user.email).toBe('editor@duta.test');
  });

  it('akun baru belum punya peran (peran diisi Admin, ADR 002)', async () => {
    const [u] = await db.select().from(s.user);
    expect(u.peran).toBeNull();
  });
});
