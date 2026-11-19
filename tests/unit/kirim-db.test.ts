import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { beforeAll, describe, expect, it } from 'vitest';
import * as s from '@/lib/db/schema';
import { layananKirimKarya, type DepsKirim } from '@/fitur/karya/layanan';
import { dekripsiKontak } from '@/lib/kripto-kontak';
import { buatKodeLacak, kodeLacakValid } from '@/lib/kode-lacak';

const kunci = randomBytes(32);
const tulisan = {
  jenis: 'tulisan',
  judul: 'Pasar pagi',
  isi: 'Batak, Melayu, dan Tionghoa berbagi lapak.',
  namaPanggung: 'anakmedan',
  kontak: '0812-3456-789',
  namaLengkap: 'Dimas Pratama',
  sekolah: 'SMA 1 Binjai',
  buatanSendiri: true,
};

describe('layanan kirim karya ke database', () => {
  let db: DepsKirim['db'];
  let jumlah = async () => (await (db as ReturnType<typeof drizzle<typeof s>>).select().from(s.karya)).length;

  const deps = (over: Partial<DepsKirim> = {}): DepsKirim => ({
    db, kunci, secretTurnstile: 'rahasia', cekTurnstile: async () => true, buatKode: buatKodeLacak, ...over,
  });

  beforeAll(async () => {
    const klien = drizzle(new PGlite(), { schema: s });
    await migrate(klien, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
    db = klien as unknown as DepsKirim['db'];
  });

  it('menyimpan tulisan dengan kode lacak, dan kontak hanya tersimpan terenkripsi', async () => {
    const hasil = await layananKirimKarya(tulisan, { turnstile: 'token' }, deps());
    expect(hasil.ok).toBe(true);
    if (!hasil.ok) return;
    expect(kodeLacakValid(hasil.kode)).toBe(true);

    const [baris] = await (db as ReturnType<typeof drizzle<typeof s>>).select().from(s.karya);
    expect(baris.kodeLacak).toBe(hasil.kode);
    expect(baris.tahap).toBe('antrean');
    expect(baris.oleh).toBe('anakmedan');
    expect(baris.kontakTerenkripsi).not.toContain('0812');
    expect(baris.kontakTerenkripsi).not.toContain('Dimas');
    const bundel = JSON.parse(dekripsiKontak(baris.kontakTerenkripsi!, kunci));
    expect(bundel).toEqual({ kontak: '0812-3456-789', namaLengkap: 'Dimas Pratama', sekolah: 'SMA 1 Binjai' });
  });

  it('menolak desain karena penyimpanan berkas belum ada, dan tidak menyimpan apa pun', async () => {
    const sebelum = await jumlah();
    const hasil = await layananKirimKarya({ ...tulisan, jenis: 'desain', isi: '', berkas: { nama: 'a.png', tipe: 'image/png', ukuranByte: 1000 } },
      { turnstile: 'token' }, deps());
    expect(hasil.ok).toBe(false);
    expect(await jumlah()).toBe(sebelum);
  });

  it('gagal jika Turnstile tidak lolos, tanpa menyimpan', async () => {
    const sebelum = await jumlah();
    const hasil = await layananKirimKarya(tulisan, { turnstile: '' }, deps({ cekTurnstile: async () => false }));
    expect(hasil.ok).toBe(false);
    expect(await jumlah()).toBe(sebelum);
  });

  it('gagal jika data tidak valid, tanpa menyimpan', async () => {
    const sebelum = await jumlah();
    const hasil = await layananKirimKarya({ ...tulisan, buatanSendiri: false }, { turnstile: 'token' }, deps());
    expect(hasil.ok).toBe(false);
    expect(await jumlah()).toBe(sebelum);
  });
});
