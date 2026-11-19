import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { beforeAll, describe, expect, it } from 'vitest';
import * as s from '@/lib/db/schema';
import { STATUS_TULISAN } from '@/fitur/tulisan/alur-status';
import { TAHAP_KARYA } from '@/fitur/karya/alur-seleksi';
import { STATUS_KOMENTAR } from '@/fitur/moderasi/komentar';
import { STATUS_SARAN } from '@/fitur/saran/alur-saran';
import { PERAN } from '@/lib/izin';

describe('nilai enum skema sama dengan modul domain', () => {
  it('status tulisan, tahap karya, komentar, saran, dan peran', () => {
    expect([...s.STATUS_TULISAN]).toEqual([...STATUS_TULISAN]);
    expect([...s.TAHAP_KARYA]).toEqual([...TAHAP_KARYA]);
    expect([...s.STATUS_KOMENTAR]).toEqual([...STATUS_KOMENTAR]);
    expect([...s.STATUS_SARAN]).toEqual([...STATUS_SARAN]);
    expect([...s.PERAN_TIM]).toEqual(PERAN.filter((p) => p !== 'publik'));
  });
});

describe('database (migrasi dijalankan di PGlite)', () => {
  let db: ReturnType<typeof drizzle<typeof s>>;

  beforeAll(async () => {
    const client = new PGlite();
    db = drizzle(client, { schema: s });
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
    await db.insert(s.rubrik).values({ slug: 'tips-skill', nama: 'Tips Skill', deskripsi: 'Literasi digital.' });
  });

  it('menerima tulisan dengan status yang valid dan status default draf', async () => {
    const [baris] = await db.insert(s.tulisan).values({
      slug: 'cek-fakta', judul: 'Cek fakta dalam 5 langkah', rubrikSlug: 'tips-skill', tenggat: '2026-11-25',
    }).returning();
    expect(baris.status).toBe('draf');
    expect(baris.penanggung).toEqual([]);
  });

  it('menolak status tulisan di luar daftar', async () => {
    await expect(db.insert(s.tulisan).values({
      slug: 'salah', judul: 'Salah', rubrikSlug: 'tips-skill', tenggat: '2026-11-25', status: 'arsip' as never,
    })).rejects.toThrow();
  });

  it('menolak rubrik yang tidak ada', async () => {
    await expect(db.insert(s.tulisan).values({
      slug: 'rubrik-hilang', judul: 'Tanpa rubrik', rubrikSlug: 'tidak-ada', tenggat: '2026-11-25',
    })).rejects.toThrow();
  });

  it('komentar ikut terhapus saat tulisannya dihapus', async () => {
    const [t] = await db.insert(s.tulisan).values({
      slug: 'hapus-saya', judul: 'Akan dihapus', rubrikSlug: 'tips-skill', tenggat: '2026-11-25',
    }).returning();
    await db.insert(s.komentar).values({ tulisanId: t.id, namaPengirim: 'Sandi', isi: 'Komentar.' });
    await db.delete(s.tulisan).where(eq(s.tulisan.id, t.id));
    const sisa = await db.select().from(s.komentar).where(eq(s.komentar.tulisanId, t.id));
    expect(sisa).toHaveLength(0);
  });

  it('karya menyimpan kontak terenkripsi dan tanggal hapus (ADR 005)', async () => {
    const hapusPada = new Date('2026-12-19T00:00:00Z');
    const [k] = await db.insert(s.karya).values({
      kodeLacak: 'DD-UJI-0001', jenis: 'tulisan', judul: 'Puisi', oleh: 'Rani', tahap: 'keputusan',
      kontakTerenkripsi: 'v1.x.y.z', kontakHapusPada: hapusPada,
    }).returning();
    expect(k.tahap).toBe('keputusan');
    expect(k.kontakHapusPada?.toISOString()).toBe(hapusPada.toISOString());
  });
});
