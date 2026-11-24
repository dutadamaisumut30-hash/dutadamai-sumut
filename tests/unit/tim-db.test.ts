import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { beforeAll, describe, expect, it } from 'vitest';
import * as s from '@/lib/db/schema';
import { ambilAnggota, hapusAnggota, tambahAnggota, ubahAnggota } from '@/fitur/tim/layanan';

describe('akun tim: tambah, ubah, hapus', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;

  beforeAll(async () => {
    db = drizzle(new PGlite(), { schema: s });
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
  });

  it('menambah anggota dan mencatat audit', async () => {
    const sebelum = (await ambilAnggota(db)).length;
    expect((await tambahAnggota(db, { nama: 'Uji Satu', peran: 'Penulis', divisi: 'Blogger' }, 'admin')).ok).toBe(true);
    const sesudah = await ambilAnggota(db);
    expect(sesudah).toHaveLength(sebelum + 1);
    expect(sesudah.some((a: { nama: string }) => a.nama === 'Uji Satu')).toBe(true);
    expect((await db.select().from(s.logAudit)).some((l: { aksi: string }) => l.aksi === 'tambah_anggota_tim')).toBe(true);
  });

  it('mengubah nama, peran, divisi, dan tampil; menolak isian kosong atau divisi asing', async () => {
    const id = (await ambilAnggota(db)).find((a: { nama: string }) => a.nama === 'Uji Satu')!.id;
    expect((await ubahAnggota(db, id, { nama: 'Uji Dua', peran: 'Desainer', divisi: 'DKV', tampil: false }, 'admin')).ok).toBe(true);
    const a = (await ambilAnggota(db)).find((x: { id: string }) => x.id === id);
    expect(a).toMatchObject({ nama: 'Uji Dua', peran: 'Desainer', divisi: 'DKV', tampil: false });
    expect((await ubahAnggota(db, id, { nama: '   ' }, 'admin')).ok).toBe(false);
    expect((await ubahAnggota(db, id, { peran: '' }, 'admin')).ok).toBe(false);
    expect((await ubahAnggota(db, id, { divisi: 'Asing' }, 'admin')).ok).toBe(false);
    expect((await ubahAnggota(db, '00000000-0000-0000-0000-000000000000', { tampil: true }, 'admin')).ok).toBe(false);
  });

  it('hanya Admin yang boleh menghapus, dan anggota benar-benar hilang', async () => {
    const id = (await ambilAnggota(db)).find((a: { nama: string }) => a.nama === 'Uji Dua')!.id;
    const sebelum = (await ambilAnggota(db)).length;
    for (const peran of ['editor', 'dkv', 'blogger', 'publik'] as const) {
      expect((await hapusAnggota(db, id, peran)).ok).toBe(false);
    }
    expect(await ambilAnggota(db)).toHaveLength(sebelum);
    expect((await hapusAnggota(db, id, 'admin')).ok).toBe(true);
    expect(await ambilAnggota(db)).toHaveLength(sebelum - 1);
    expect((await hapusAnggota(db, id, 'admin')).ok).toBe(false);
    expect((await db.select().from(s.logAudit)).some((l: { aksi: string }) => l.aksi === 'hapus_anggota_tim')).toBe(true);
  });
});
