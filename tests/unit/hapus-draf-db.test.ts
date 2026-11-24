import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { beforeAll, describe, expect, it } from 'vitest';
import * as s from '@/lib/db/schema';
import { buatDraf, hapusDraf } from '@/fitur/tulis/layanan';
import { ubahStatus } from '@/fitur/tulisan/layanan';

describe('hapus draf', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  const blogger = { userId: 'u-blogger', nama: 'Bl', peran: 'blogger' as const };
  const lain = { userId: 'u-lain', nama: 'Ln', peran: 'blogger' as const };
  const editor = { userId: 'u-editor', nama: 'Ed', peran: 'editor' as const };

  beforeAll(async () => {
    db = drizzle(new PGlite(), { schema: s });
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
    await db.insert(s.rubrik).values({ slug: 'cerita-sumut', nama: 'Cerita Sumut', deskripsi: 'Cerita dari berbagai penjuru Sumatera Utara.' });
  });

  const isi = { judul: 'Judul uji hapus', isi: 'x'.repeat(120) };
  const baru = async (p = blogger) => {
    const h = await buatDraf(db, p, { ...isi, rubrikSlug: 'cerita-sumut' });
    if (!h.ok) throw new Error(h.pesan);
    return h.id as string;
  };

  it('pemilik menghapus drafnya, orang lain tidak boleh, editor boleh', async () => {
    const id = await baru();
    expect((await hapusDraf(db, lain, id)).ok).toBe(false);
    expect((await hapusDraf(db, blogger, id)).ok).toBe(true);
    expect((await hapusDraf(db, blogger, id)).ok).toBe(false);
    const id2 = await baru();
    expect((await hapusDraf(db, editor, id2)).ok).toBe(true);
  });

  it('tidak bisa menghapus tulisan yang sudah diajukan', async () => {
    const id = await baru();
    expect((await ubahStatus(db, { id, ke: 'menunggu_desain', peran: 'blogger' })).ok).toBe(true);
    expect((await hapusDraf(db, blogger, id)).ok).toBe(false);
    expect((await hapusDraf(db, editor, id)).ok).toBe(false);
  });
});
