import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { beforeAll, describe, expect, it } from 'vitest';
import * as s from '@/lib/db/schema';
import { layananKirimSaran, type DepsSaran } from '@/fitur/saran/layanan';
import { ambilStatusLacak } from '@/fitur/karya/lacak';
import { dekripsiKontak } from '@/lib/kripto-kontak';

const kunci = randomBytes(32);
type Db = ReturnType<typeof drizzle<typeof s>>;

describe('kotak saran dan lacak di database', () => {
  let db: Db;
  const deps = (over: Partial<DepsSaran> = {}): DepsSaran => ({
    db: db as unknown as DepsSaran['db'], kunci, secretTurnstile: 'rahasia', cekTurnstile: async () => true, ...over,
  });

  beforeAll(async () => {
    db = drizzle(new PGlite(), { schema: s });
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
    await db.insert(s.karya).values({
      kodeLacak: 'DD-UJI-LACAK', jenis: 'tulisan', judul: 'Puisi sungai', oleh: 'Rani', tahap: 'dihubungi',
      kontakTerenkripsi: 'v1.x.y.z',
    });
  });

  it('menyimpan saran dengan kontak terenkripsi dan status baru', async () => {
    const hasil = await layananKirimSaran({ kategori: 'Saran konten', pesan: 'Tolong ada rubrik untuk SD.', kontak: '@guru.medan' },
      { turnstile: 't' }, deps());
    expect(hasil.ok).toBe(true);
    const [baris] = await db.select().from(s.saran);
    expect(baris.status).toBe('baru');
    expect(baris.kontakTerenkripsi).not.toContain('guru');
    expect(dekripsiKontak(baris.kontakTerenkripsi!, kunci)).toBe('@guru.medan');
  });

  it('saran tanpa kontak tidak menyimpan kontak', async () => {
    const hasil = await layananKirimSaran({ kategori: 'Masalah teknis', pesan: 'Gambar lama muncul di HP.' }, { turnstile: 't' }, deps());
    expect(hasil.ok).toBe(true);
    const semua = await db.select().from(s.saran);
    expect(semua.some((x) => x.kontakTerenkripsi === null)).toBe(true);
  });

  it('saran ditolak jika Turnstile gagal atau pesan terlalu pendek', async () => {
    const sebelum = (await db.select().from(s.saran)).length;
    expect((await layananKirimSaran({ kategori: 'Saran konten', pesan: 'Tolong ada rubrik untuk SD.' }, { turnstile: '' }, deps({ cekTurnstile: async () => false }))).ok).toBe(false);
    expect((await layananKirimSaran({ kategori: 'Saran konten', pesan: 'pendek' }, { turnstile: 't' }, deps())).ok).toBe(false);
    expect((await db.select().from(s.saran)).length).toBe(sebelum);
  });

  it('lacak mengembalikan tahap dan judul, tanpa kontak', async () => {
    const status = await ambilStatusLacak(db as unknown as DepsSaran['db'], 'DD-UJI-LACAK');
    expect(status).toMatchObject({ judul: 'Puisi sungai', tahap: 'dihubungi', jenis: 'tulisan' });
    expect(status).not.toHaveProperty('kontakTerenkripsi');
    expect(await ambilStatusLacak(db as unknown as DepsSaran['db'], 'DD-TIDAK-ADA')).toBeNull();
  });

  it('catatan redaksi hanya tampil untuk karya yang dikembalikan', async () => {
    const dbx = db as unknown as DepsSaran['db'];
    await db.insert(s.karya).values([
      { kodeLacak: 'DD-UJI-BALIK', jenis: 'tulisan', judul: 'Cerpen hujan', oleh: 'Sari', tahap: 'dikembalikan', catatan: 'Perjelas paragraf akhir.' },
      { kodeLacak: 'DD-UJI-NILAI', jenis: 'tulisan', judul: 'Esai kota', oleh: 'Budi', tahap: 'dihubungi', catatan: 'catatan lama' },
    ]);
    expect((await ambilStatusLacak(dbx, 'DD-UJI-BALIK'))?.catatan).toBe('Perjelas paragraf akhir.');
    expect(await ambilStatusLacak(dbx, 'DD-UJI-NILAI')).not.toHaveProperty('catatan');
  });
});
