import { and, desc, eq, inArray } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { berkas, tulisan } from '@/lib/db/schema';
import { catatAudit } from '@/lib/audit';
import type { Peran } from '@/lib/izin';
import { bolehAksi } from '@/lib/izin';
import { cocokSignature, hapusBerkas, MIME_IZIN, simpanBerkas, UKURAN_MAKS } from '@/lib/penyimpanan';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export interface BerkasInfo {
  id: string;
  namaAsli: string;
  ukuran: number;
}

type Hasil = { ok: true } | { ok: false; pesan: string };

export async function ambilBerkasTulisan(db: Db, tulisanId: string): Promise<BerkasInfo[]> {
  return db
    .select({ id: berkas.id, namaAsli: berkas.namaAsli, ukuran: berkas.ukuran })
    .from(berkas)
    .where(eq(berkas.tulisanId, tulisanId))
    .orderBy(desc(berkas.pada));
}

export async function unggahBerkasTulisan(
  db: Db,
  input: { tulisanId: string; nama: string; mime: string; isi: Buffer; peran: Peran },
): Promise<Hasil> {
  if (!(input.mime in MIME_IZIN)) return { ok: false, pesan: 'Jenis berkas hanya PNG, JPG, atau PDF.' };
  if (input.isi.length === 0) return { ok: false, pesan: 'Berkas kosong.' };
  if (input.isi.length > UKURAN_MAKS) return { ok: false, pesan: 'Ukuran berkas maksimal 10 MB.' };
  if (!cocokSignature(input.isi, input.mime)) return { ok: false, pesan: 'Isi berkas tidak sesuai jenisnya.' };

  try {
    const [t] = await db.select({ id: tulisan.id }).from(tulisan).where(eq(tulisan.id, input.tulisanId));
    if (!t) return { ok: false, pesan: 'Tulisan tidak ditemukan.' };

    const lokasi = await simpanBerkas(input.isi, input.mime);
    await db.insert(berkas).values({
      tulisanId: input.tulisanId,
      namaAsli: input.nama.slice(0, 200),
      jenisMime: input.mime,
      ukuran: input.isi.length,
      lokasi,
      diunggahOleh: input.peran,
    });
    await catatAudit(db, {
      peran: input.peran,
      aksi: 'unggah_berkas',
      objek: 'tulisan',
      objekId: input.tulisanId,
      catatan: `${input.nama.slice(0, 120)} (${input.isi.length} byte)`,
    });
    return { ok: true };
  } catch {
    return { ok: false, pesan: 'Berkas belum tersimpan. Coba lagi beberapa saat lagi.' };
  }
}

/** Gambar sampul terbaru (PNG/JPG) dari tulisan yang sudah terbit. PDF tidak dipakai sebagai sampul. */
export async function ambilSampul(db: Db, slug: string): Promise<{ lokasi: string; jenisMime: string } | null> {
  const [b] = await db
    .select({ lokasi: berkas.lokasi, jenisMime: berkas.jenisMime })
    .from(berkas)
    .innerJoin(tulisan, eq(berkas.tulisanId, tulisan.id))
    .where(and(eq(tulisan.slug, slug), eq(tulisan.status, 'terbit'), inArray(berkas.jenisMime, ['image/png', 'image/jpeg'])))
    .orderBy(desc(berkas.pada))
    .limit(1);
  return b ?? null;
}

/** Menghapus berkas desain tulisan (misalnya cover yang salah). Hanya DKV, Editor, dan Admin. Berkas karya publik tidak bisa dihapus dari sini. */
export async function hapusBerkasTulisan(db: Db, id: string, peran: Peran): Promise<Hasil> {
  if (!bolehAksi(peran, 'unggah_desain')) return { ok: false, pesan: 'Hanya DKV, Editor, dan Admin yang boleh menghapus berkas desain.' };
  try {
    const [b] = await db.select({ id: berkas.id, lokasi: berkas.lokasi, tulisanId: berkas.tulisanId, namaAsli: berkas.namaAsli }).from(berkas).where(eq(berkas.id, id));
    if (!b || !b.tulisanId) return { ok: false, pesan: 'Berkas tidak ditemukan.' };
    await db.delete(berkas).where(eq(berkas.id, id));
    await hapusBerkas(b.lokasi);
    await catatAudit(db, { peran, aksi: 'hapus_berkas', objek: 'tulisan', objekId: b.tulisanId, catatan: String(b.namaAsli).slice(0, 120) });
    return { ok: true };
  } catch {
    return { ok: false, pesan: 'Berkas belum terhapus. Coba lagi.' };
  }
}
