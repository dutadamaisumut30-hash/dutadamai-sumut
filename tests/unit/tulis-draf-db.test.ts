import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import * as s from '@/lib/db/schema';
import { ajukanDraf, ambilTulisanSaya, buatDraf, buatSlug, simpanDraf, type Penulis } from '@/fitur/tulis/layanan';

const A: Penulis = { userId: 'user-a', nama: 'Penulis A', peran: 'blogger' };
const B: Penulis = { userId: 'user-b', nama: 'Penulis B', peran: 'blogger' };
const PANJANG = 'Kalimat contoh yang cukup panjang untuk lolos syarat minimal isi. '.repeat(3);

describe('draf tulisan oleh blogger', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  let id = '';

  beforeAll(async () => {
    db = drizzle(new PGlite(), { schema: s });
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
    await db.insert(s.rubrik).values({ slug: 'cerita-sumut', nama: 'Cerita Sumut', deskripsi: 'Cerita dari berbagai penjuru Sumatera Utara.' });
  });

  it('membuat slug yang bersih dan unik', () => {
    expect(buatSlug('Pasar Pagi: Medan!', 'abc123')).toBe('pasar-pagi-medan-abc123');
    expect(buatSlug('???', 'x1')).toBe('tulisan-x1');
  });

  it('membuat draf berstatus draf milik penulis', async () => {
    const h = await buatDraf(db, A, { judul: 'Pasar pagi di Medan', rubrikSlug: 'cerita-sumut', isi: 'Awal cerita.' });
    expect(h.ok).toBe(true);
    if (!h.ok || !h.id) return;
    id = h.id;
    const [t] = await db.select().from(s.tulisan).where(eq(s.tulisan.id, id));
    expect(t.status).toBe('draf');
    expect(t.penulisId).toBe('user-a');
    expect(t.penanggung).toEqual(['Penulis A']);
    expect(await ambilTulisanSaya(db, 'user-b')).toHaveLength(0);
    expect(await ambilTulisanSaya(db, 'user-a')).toHaveLength(1);
  });

  it('menolak data tidak valid dan rubrik yang tidak ada', async () => {
    expect((await buatDraf(db, A, { judul: 'ab', rubrikSlug: 'cerita-sumut', isi: '' })).ok).toBe(false);
    expect((await buatDraf(db, A, { judul: 'Judul cukup panjang', rubrikSlug: 'tidak-ada', isi: '' })).ok).toBe(false);
  });

  it('penulis lain tidak bisa mengubah atau mengajukan draf orang', async () => {
    expect((await simpanDraf(db, B, id, { judul: 'Dibajak orang', rubrikSlug: 'cerita-sumut', isi: 'x' })).ok).toBe(false);
    expect((await ajukanDraf(db, B, id)).ok).toBe(false);
    const [t] = await db.select().from(s.tulisan).where(eq(s.tulisan.id, id));
    expect(t.judul).toBe('Pasar pagi di Medan');
  });

  it('draf terlalu pendek tidak bisa diajukan, yang cukup panjang menjadi menunggu_desain', async () => {
    expect((await ajukanDraf(db, A, id)).ok).toBe(false);
    expect((await simpanDraf(db, A, id, { judul: 'Pasar pagi di Medan', rubrikSlug: 'cerita-sumut', isi: PANJANG })).ok).toBe(true);
    expect((await ajukanDraf(db, A, id)).ok).toBe(true);
    const [t] = await db.select().from(s.tulisan).where(eq(s.tulisan.id, id));
    expect(t.status).toBe('menunggu_desain');
  });

  it('setelah diajukan, draf tidak bisa diubah lagi', async () => {
    expect((await simpanDraf(db, A, id, { judul: 'Judul baru lagi', rubrikSlug: 'cerita-sumut', isi: PANJANG })).ok).toBe(false);
    expect((await ajukanDraf(db, A, id)).ok).toBe(false);
  });
});
