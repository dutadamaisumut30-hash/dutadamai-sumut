import { asc, eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { anggotaTim } from '@/lib/db/schema';
import { catatAudit } from '@/lib/audit';
import type { Peran } from '@/lib/izin';
import { DIVISI_AWAL, validasiAnggota, type AnggotaTim, type HasilTim } from './tim';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export type PatchAnggota = { peran?: string; divisi?: string; tampil?: boolean };

const kolom = {
  id: anggotaTim.id,
  nama: anggotaTim.nama,
  peran: anggotaTim.peran,
  divisi: anggotaTim.divisi,
  tampil: anggotaTim.tampil,
};

export async function ambilAnggota(db: Db): Promise<AnggotaTim[]> {
  return db.select(kolom).from(anggotaTim).orderBy(asc(anggotaTim.urutan), asc(anggotaTim.dibuatPada));
}

export async function ambilAnggotaTampil(db: Db): Promise<AnggotaTim[]> {
  return db
    .select(kolom)
    .from(anggotaTim)
    .where(eq(anggotaTim.tampil, true))
    .orderBy(asc(anggotaTim.urutan), asc(anggotaTim.dibuatPada));
}

export async function tambahAnggota(
  db: Db,
  input: { nama: string; peran: string; divisi: string },
  pelaku: Peran,
): Promise<HasilTim> {
  const cek = validasiAnggota(input);
  if (!cek.ok) return cek;
  if (!(DIVISI_AWAL as readonly string[]).includes(input.divisi)) return { ok: false, alasan: 'Divisi tidak dikenal.' };
  try {
    const [baru] = await db
      .insert(anggotaTim)
      .values({ nama: input.nama.trim(), peran: input.peran.trim(), divisi: input.divisi })
      .returning({ id: anggotaTim.id });
    await catatAudit(db, {
      peran: pelaku,
      aksi: 'tambah_anggota_tim',
      objek: 'anggota_tim',
      objekId: baru.id,
      catatan: `${input.nama.trim()} (${input.divisi})`.slice(0, 120),
    });
    return { ok: true };
  } catch {
    return { ok: false, alasan: 'Anggota belum tersimpan. Coba lagi.' };
  }
}

export async function ubahAnggota(db: Db, id: string, patch: PatchAnggota, pelaku: Peran): Promise<HasilTim> {
  const set: { peran?: string; divisi?: string; tampil?: boolean } = {};
  if (patch.peran !== undefined) {
    if (!patch.peran.trim()) return { ok: false, alasan: 'Peran wajib diisi.' };
    set.peran = patch.peran.trim();
  }
  if (patch.divisi !== undefined) {
    if (!(DIVISI_AWAL as readonly string[]).includes(patch.divisi)) return { ok: false, alasan: 'Divisi tidak dikenal.' };
    set.divisi = patch.divisi;
  }
  if (patch.tampil !== undefined) set.tampil = patch.tampil;
  if (Object.keys(set).length === 0) return { ok: true };

  try {
    const [b] = await db.update(anggotaTim).set(set).where(eq(anggotaTim.id, id)).returning({ id: anggotaTim.id });
    if (!b) return { ok: false, alasan: 'Anggota tidak ditemukan.' };
    await catatAudit(db, {
      peran: pelaku,
      aksi: 'ubah_anggota_tim',
      objek: 'anggota_tim',
      objekId: id,
      catatan: JSON.stringify(set).slice(0, 120),
    });
    return { ok: true };
  } catch {
    return { ok: false, alasan: 'Perubahan belum tersimpan. Coba lagi.' };
  }
}
