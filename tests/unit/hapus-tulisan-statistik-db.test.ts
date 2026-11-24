import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { beforeAll, describe, expect, it } from 'vitest';
import * as s from '@/lib/db/schema';
import { buatDraf, hapusTulisan } from '@/fitur/tulis/layanan';
import { ambilStatistik } from '@/fitur/statistik';
import { ubahStatus } from '@/fitur/tulisan/layanan';

describe('hapus tulisan (Editor/Admin) dan statistik', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  const blogger = { userId: 'u-b', nama: 'Bl', peran: 'blogger' as const };

  beforeAll(async () => {
    db = drizzle(new PGlite(), { schema: s });
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
    await db.insert(s.rubrik).values({ slug: 'cerita-sumut', nama: 'Cerita Sumut', deskripsi: 'Cerita dari berbagai penjuru Sumatera Utara.' });
  });

  const baru = async () => {
    const h = await buatDraf(db, blogger, { judul: 'Judul uji hapus', rubrikSlug: 'cerita-sumut', isi: 'x'.repeat(120) });
    if (!h.ok) throw new Error(h.pesan);
    return h.id as string;
  };

  it('editor dan admin menghapus tulisan berstatus apa pun, blogger dan dkv tidak', async () => {
    const id = await baru();
    expect((await ubahStatus(db, { id, ke: 'menunggu_desain', peran: 'blogger' })).ok).toBe(true);
    expect((await hapusTulisan(db, { peran: 'blogger' }, id)).ok).toBe(false);
    expect((await hapusTulisan(db, { peran: 'dkv' }, id)).ok).toBe(false);
    expect((await hapusTulisan(db, { peran: 'editor' }, id)).ok).toBe(true);
    expect((await hapusTulisan(db, { peran: 'admin' }, id)).ok).toBe(false);
  });

  it('statistik: blogger hanya melihat miliknya, editor melihat semua dan kotak masuk', async () => {
    await baru();
    const b = await ambilStatistik(db, { peran: 'blogger', userId: 'u-b' });
    expect(b.lingkup).toBe('milikku');
    expect(b.tulisan.draf).toBeGreaterThanOrEqual(1);
    expect(b.masuk).toBeUndefined();
    const lain = await ambilStatistik(db, { peran: 'blogger', userId: 'u-lain' });
    expect(lain.tulisan.draf).toBe(0);
    const e = await ambilStatistik(db, { peran: 'editor', userId: 'u-e' });
    expect(e.lingkup).toBe('semua');
    expect(e.masuk).toBeDefined();
  });
});
