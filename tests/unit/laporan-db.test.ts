import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { beforeAll, describe, expect, it } from 'vitest';
import * as s from '@/lib/db/schema';
import { ambilLaporan, layananKirimLaporan, tandaiLaporanDitangani, type DepsLaporan } from '@/fitur/laporan/layanan';

describe('laporan konten', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  const deps = (lolos = true): DepsLaporan => ({ db, secretTurnstile: 'rahasia', cekTurnstile: async () => lolos });

  beforeAll(async () => {
    db = drizzle(new PGlite(), { schema: s });
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
  });

  it('menyimpan laporan yang valid dan mencatat audit', async () => {
    const h = await layananKirimLaporan({ alasan: 'Promosi atau spam', alamat: '/berita/contoh' }, { turnstile: 't' }, deps());
    expect(h.ok).toBe(true);
    const daftar = await ambilLaporan(db);
    expect(daftar).toHaveLength(1);
    expect(daftar[0]).toMatchObject({ alasan: 'Promosi atau spam', alamat: '/berita/contoh', status: 'baru' });
    expect((await db.select().from(s.logAudit)).some((l: { aksi: string }) => l.aksi === 'kirim_laporan')).toBe(true);
  });

  it('menolak Turnstile gagal, alasan tidak dikenal, dan "Lainnya" tanpa catatan', async () => {
    expect((await layananKirimLaporan({ alasan: 'Promosi atau spam' }, { turnstile: 't' }, deps(false))).ok).toBe(false);
    expect((await layananKirimLaporan({ alasan: 'asal' }, { turnstile: 't' }, deps())).ok).toBe(false);
    expect((await layananKirimLaporan({ alasan: 'Lainnya' }, { turnstile: 't' }, deps())).ok).toBe(false);
    expect((await ambilLaporan(db))).toHaveLength(1);
  });

  it('hanya Editor dan Admin yang boleh menandai ditangani', async () => {
    const [{ id }] = await ambilLaporan(db);
    expect((await tandaiLaporanDitangani(db, id, 'dkv')).ok).toBe(false);
    expect((await tandaiLaporanDitangani(db, id, 'blogger')).ok).toBe(false);
    expect((await tandaiLaporanDitangani(db, id, 'editor')).ok).toBe(true);
    expect((await ambilLaporan(db))[0].status).toBe('ditangani');
    expect((await tandaiLaporanDitangani(db, '00000000-0000-0000-0000-000000000000', 'admin')).ok).toBe(false);
  });
});
