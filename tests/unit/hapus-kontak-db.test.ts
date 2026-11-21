import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import * as s from '@/lib/db/schema';
import { hapusKontakKedaluwarsa } from '@/fitur/karya/hapus-kontak';
import { gantiTahapKarya } from '@/fitur/karya/seleksi';

const HARI = 24 * 60 * 60 * 1000;

describe('retensi kontak 30 hari (ADR 005)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;

  const tambah = async (kode: string, tahap: (typeof s.TAHAP_KARYA)[number], over: Partial<typeof s.karya.$inferInsert> = {}) => {
    const [b] = await db
      .insert(s.karya)
      .values({ kodeLacak: kode, jenis: 'tulisan', judul: kode, oleh: 'uji', tahap, kontakTerenkripsi: 'rahasia', ...over })
      .returning({ id: s.karya.id });
    return b.id as string;
  };
  const ambil = async (id: string) => (await db.select().from(s.karya).where(eq(s.karya.id, id)))[0];

  beforeAll(async () => {
    db = drizzle(new PGlite(), { schema: s });
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
  });

  it('keputusan terbit mengisi tanggal hapus 30 hari, revisi masuk membatalkannya', async () => {
    const terbit = await tambah('RT-1', 'dihubungi');
    expect((await gantiTahapKarya(db, terbit, 'terbit', undefined, 'editor')).ok).toBe(true);
    const k = await ambil(terbit);
    const selisih = (k.kontakHapusPada as Date).getTime() - Date.now();
    expect(selisih).toBeGreaterThan(29.9 * HARI);
    expect(selisih).toBeLessThan(30.1 * HARI);

    const revisi = await tambah('RT-2', 'keputusan');
    await gantiTahapKarya(db, revisi, 'dikembalikan', 'perbaiki judul', 'editor');
    expect((await ambil(revisi)).kontakHapusPada).not.toBeNull();
    await gantiTahapKarya(db, revisi, 'antrean', undefined, 'editor');
    expect((await ambil(revisi)).kontakHapusPada).toBeNull();
  });

  it('menghapus kontak yang sudah lewat tanggal, dan hanya itu', async () => {
    const lewat = await tambah('RT-3', 'terbit', { kontakHapusPada: new Date(Date.now() - HARI) });
    const belum = await tambah('RT-4', 'terbit', { kontakHapusPada: new Date(Date.now() + 5 * HARI) });
    const lama = await tambah('RT-5', 'ditolak');
    const proses = await tambah('RT-6', 'antrean');

    const h = await hapusKontakKedaluwarsa(db);
    expect(h.dihapus).toBeGreaterThanOrEqual(1);
    expect((await ambil(lewat)).kontakTerenkripsi).toBeNull();
    expect((await ambil(belum)).kontakTerenkripsi).toBe('rahasia');
    // Data lama tanpa tanggal: dijadwalkan 30 hari dari sekarang, belum dihapus.
    const l = await ambil(lama);
    expect(l.kontakTerenkripsi).toBe('rahasia');
    expect(l.kontakHapusPada).not.toBeNull();
    // Karya yang masih diproses tidak disentuh.
    const p = await ambil(proses);
    expect(p.kontakTerenkripsi).toBe('rahasia');
    expect(p.kontakHapusPada).toBeNull();
  });

  it('setelah 30 hari data lama ikut terhapus, dan karyanya tetap ada', async () => {
    const id = await tambah('RT-7', 'ditolak');
    await hapusKontakKedaluwarsa(db);
    await hapusKontakKedaluwarsa(db, new Date(Date.now() + 31 * HARI));
    const k = await ambil(id);
    expect(k.kontakTerenkripsi).toBeNull();
    expect(k.judul).toBe('RT-7');
  });
});
