import { eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { rubrik } from '@/lib/db/schema';
import { catatAudit } from '@/lib/audit';
import type { Peran } from '@/lib/izin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export interface RubrikDb {
  slug: string;
  nama: string;
  deskripsi: string;
}

export type HasilRubrik = { ok: true } | { ok: false; alasan: string };

// Urutan tampil rubrik sama dengan urutan di menu sebelumnya.
const URUTAN = ['cerita-sumut', 'opini-pelajar', 'profil-duta', 'tips-skill', 'di-balik-layar'];

export async function ambilRubrik(db: Db): Promise<RubrikDb[]> {
  const baris: RubrikDb[] = await db
    .select({ slug: rubrik.slug, nama: rubrik.nama, deskripsi: rubrik.deskripsi })
    .from(rubrik);
  const peringkat = (slug: string) => {
    const i = URUTAN.indexOf(slug);
    return i < 0 ? URUTAN.length : i;
  };
  return [...baris].sort((a, b) => peringkat(a.slug) - peringkat(b.slug));
}

export async function ubahDeskripsiRubrik(db: Db, slug: string, deskripsi: string, pelaku: Peran): Promise<HasilRubrik> {
  const teks = deskripsi.trim();
  if (teks.length < 10) return { ok: false, alasan: 'Deskripsi minimal 10 karakter.' };
  if (teks.length > 300) return { ok: false, alasan: 'Deskripsi maksimal 300 karakter.' };
  try {
    const [b] = await db.update(rubrik).set({ deskripsi: teks }).where(eq(rubrik.slug, slug)).returning({ slug: rubrik.slug });
    if (!b) return { ok: false, alasan: 'Rubrik tidak ditemukan.' };
    await catatAudit(db, { peran: pelaku, aksi: 'ubah_rubrik', objek: 'rubrik', objekId: slug, catatan: teks.slice(0, 120) });
    return { ok: true };
  } catch {
    return { ok: false, alasan: 'Deskripsi belum tersimpan. Coba lagi.' };
  }
}
