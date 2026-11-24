import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { beforeAll, describe, expect, it } from 'vitest';
import * as s from '@/lib/db/schema';
import { enkripsiKontak } from '@/lib/kripto-kontak';
import { bacaKontakKarya } from '@/fitur/karya/seleksi';
import { ambilSampul, hapusBerkasTulisan } from '@/fitur/berkas/layanan';

describe('kontak karya dan sampul publik', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  const kunci = randomBytes(32);
  const ids: Record<string, string> = {};

  beforeAll(async () => {
    db = drizzle(new PGlite(), { schema: s });
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
    const bundel = enkripsiKontak(JSON.stringify({ kontak: 'a@b.test', namaLengkap: null, sekolah: null }), kunci);
    for (const [nama, tahap, kontak] of [['layak', 'dihubungi', bundel], ['antrean', 'antrean', bundel], ['hapus', 'dihubungi', null]] as const) {
      const [r] = await db.insert(s.karya).values({
        kodeLacak: `KD-${nama}`, jenis: 'tulisan', judul: nama, isi: 'x', oleh: 'uji', tahap, kontakTerenkripsi: kontak,
      }).returning({ id: s.karya.id });
      ids[nama] = r.id;
    }
    await db.insert(s.rubrik).values({ slug: 'cerita-sumut', nama: 'Cerita Sumut', deskripsi: 'd' });
    for (const [slug, status] of [['terbit-a', 'terbit'], ['draf-a', 'draf']] as const) {
      const [t] = await db.insert(s.tulisan).values({
        slug, judul: slug, isi: 'x', rubrikSlug: 'cerita-sumut', status, penanggung: ['u'], tenggat: '2026-12-01',
      }).returning({ id: s.tulisan.id });
      await db.insert(s.berkas).values({ tulisanId: t.id, namaAsli: 'c.png', jenisMime: 'image/png', ukuran: 1, lokasi: `${slug}.png`, diunggahOleh: 'dkv' });
    }
  });

  it('kontak hanya terbuka untuk Editor/Admin pada tahap yang tepat, dan dicatat', async () => {
    expect((await bacaKontakKarya(db, ids.layak, kunci, 'dkv')).ok).toBe(false);
    expect((await bacaKontakKarya(db, ids.layak, kunci, 'blogger')).ok).toBe(false);
    const h = await bacaKontakKarya(db, ids.layak, kunci, 'editor');
    expect(h).toMatchObject({ ok: true, kontak: 'a@b.test' });
    expect((await bacaKontakKarya(db, ids.antrean, kunci, 'editor')).ok).toBe(false);
    expect((await bacaKontakKarya(db, ids.hapus, kunci, 'admin')).ok).toBe(false);
    expect((await bacaKontakKarya(db, ids.layak, randomBytes(32), 'editor')).ok).toBe(false);
    expect((await db.select().from(s.logAudit)).some((l: { aksi: string }) => l.aksi === 'baca_kontak_karya')).toBe(true);
  });

  it('sampul hanya untuk tulisan yang sudah terbit', async () => {
    expect(await ambilSampul(db, 'terbit-a')).toMatchObject({ jenisMime: 'image/png' });
    expect(await ambilSampul(db, 'draf-a')).toBeNull();
    expect(await ambilSampul(db, 'tidak-ada')).toBeNull();
  });

  it('hapus berkas desain hanya untuk DKV, Editor, dan Admin', async () => {
    const [b] = await db.select().from(s.berkas).limit(1);
    expect((await hapusBerkasTulisan(db, b.id, 'blogger')).ok).toBe(false);
    expect((await hapusBerkasTulisan(db, b.id, 'dkv')).ok).toBe(true);
    expect((await hapusBerkasTulisan(db, b.id, 'dkv')).ok).toBe(false);
    expect((await db.select().from(s.logAudit)).some((l: { aksi: string }) => l.aksi === 'hapus_berkas')).toBe(true);
  });
});
