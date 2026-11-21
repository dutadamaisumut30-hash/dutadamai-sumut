import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import * as s from '@/lib/db/schema';
import { ambilSaranMasuk, gantiStatusSaran } from '@/fitur/saran/moderasi';

describe('moderasi saran di database', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  let id = '';

  beforeAll(async () => {
    db = drizzle(new PGlite(), { schema: s });
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
    const [b] = await db
      .insert(s.saran)
      .values({ kategori: 'Saran konten', pesan: 'Tolong tambah rubrik sekolah dasar.', kontakTerenkripsi: 'rahasia-terenkripsi' })
      .returning({ id: s.saran.id });
    id = b.id;
  });

  it('menampilkan saran tanpa kontak terenkripsi', async () => {
    const daftar = await ambilSaranMasuk(db);
    expect(daftar).toHaveLength(1);
    expect(daftar[0].status).toBe('baru');
    expect(JSON.stringify(daftar)).not.toContain('rahasia-terenkripsi');
  });

  it('editor memindahkan status dan perubahan tersimpan beserta jejak audit', async () => {
    expect((await gantiStatusSaran(db, id, 'dibaca', 'editor')).ok).toBe(true);
    const [b] = await db.select().from(s.saran).where(eq(s.saran.id, id));
    expect(b.status).toBe('dibaca');
    const log = await db.select().from(s.logAudit).where(eq(s.logAudit.aksi, 'ubah_status_saran'));
    expect(log).toHaveLength(1);
    expect(log[0].catatan).toBe('baru -> dibaca');
  });

  it('menolak peran selain editor dan admin, serta lompatan status', async () => {
    expect((await gantiStatusSaran(db, id, 'ditindak', 'dkv')).ok).toBe(false);
    expect((await gantiStatusSaran(db, id, 'baru', 'editor')).ok).toBe(false);
    const [b] = await db.select().from(s.saran).where(eq(s.saran.id, id));
    expect(b.status).toBe('dibaca');
  });

  it('saran yang tidak ada ditolak', async () => {
    const hasil = await gantiStatusSaran(db, '00000000-0000-0000-0000-000000000000', 'dibaca', 'admin');
    expect(hasil.ok).toBe(false);
  });
});
