import { desc, eq, inArray } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { berkas, karya } from '@/lib/db/schema';
import { catatAudit } from '@/lib/audit';
import { bolehAksi, type Peran } from '@/lib/izin';
import { dekripsiKontak } from '@/lib/kripto-kontak';
import type { TahapKarya } from './alur-seleksi';
import { tanggalHapusKontak } from './kontak-retensi';
import { pindahSeleksi, type HasilSeleksi } from './pindah-seleksi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export interface KaryaMasukDb {
  id: string;
  judul: string;
  jenis: 'tulisan' | 'desain';
  oleh: string;
  diterima: string;
  tahap: TahapKarya;
  catatan?: string;
  isi?: string;
  berkas: { id: string; namaAsli: string }[];
}

function tanggalPendek(d: Date): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).format(d);
}

/** Semua karya masuk, terbaru dulu. Data kontak pengirim tidak diambil. */
export async function ambilKaryaMasuk(db: Db): Promise<KaryaMasukDb[]> {
  const baris = await db
    .select({ id: karya.id, judul: karya.judul, jenis: karya.jenis, oleh: karya.oleh, tahap: karya.tahap, catatan: karya.catatan, isi: karya.isi, dibuatPada: karya.dibuatPada })
    .from(karya)
    .orderBy(desc(karya.dibuatPada));
  if (baris.length === 0) return [];

  const ids = baris.map((b: any) => b.id);
  const files = await db
    .select({ id: berkas.id, karyaId: berkas.karyaId, namaAsli: berkas.namaAsli })
    .from(berkas)
    .where(inArray(berkas.karyaId, ids));

  return baris.map((b: any) => ({
    id: b.id,
    judul: b.judul,
    jenis: b.jenis,
    oleh: b.oleh,
    diterima: tanggalPendek(b.dibuatPada),
    tahap: b.tahap,
    catatan: b.catatan ?? undefined,
    isi: b.isi ?? undefined,
    berkas: files.filter((f: any) => f.karyaId === b.id).map((f: any) => ({ id: f.id, namaAsli: f.namaAsli })),
  }));
}

/** Memindahkan tahap karya. Aturan perpindahan ada di pindahSeleksi. */
export async function gantiTahapKarya(
  db: Db,
  id: string,
  ke: TahapKarya,
  catatan: string | undefined,
  peran: Peran,
): Promise<HasilSeleksi> {
  try {
    const [k] = await db.select({ tahap: karya.tahap }).from(karya).where(eq(karya.id, id));
    if (!k) return { ok: false, alasan: 'Karya tidak ditemukan.' };
    const cek = pindahSeleksi({ dari: k.tahap, ke, peran, catatan });
    if (!cek.ok) return cek;

    // ADR 005: keputusan final (terbit, ditolak) dan pengembalian memulai hitungan 30 hari.
    // Revisi yang masuk kembali ke antrean membatalkan hitungan itu.
    const hapusPada =
      ke === 'terbit' || ke === 'ditolak' || ke === 'dikembalikan'
        ? tanggalHapusKontak(new Date())
        : ke === 'antrean'
          ? null
          : undefined;
    await db
      .update(karya)
      .set({
        tahap: ke,
        ...(ke === 'dikembalikan' ? { catatan: catatan!.trim() } : {}),
        ...(hapusPada !== undefined ? { kontakHapusPada: hapusPada } : {}),
      })
      .where(eq(karya.id, id));
    await catatAudit(db, {
      peran,
      aksi: 'ubah_tahap_karya',
      objek: 'karya',
      objekId: id,
      catatan: `${k.tahap} -> ${ke}`,
    });
    return { ok: true };
  } catch {
    return { ok: false, alasan: 'Perubahan belum tersimpan. Coba lagi.' };
  }
}

export type HasilKontak =
  | { ok: true; kontak: string; namaLengkap: string | null; sekolah: string | null }
  | { ok: false; alasan: string };

/**
 * Membuka kontak pengirim untuk dihubungi. Hanya Editor/Admin, hanya saat karya sudah dinyatakan layak
 * (tahap dihubungi) atau dikembalikan, dan setiap pembukaan dicatat di log audit.
 */
export async function bacaKontakKarya(db: Db, id: string, kunci: Buffer, peran: Peran): Promise<HasilKontak> {
  if (!bolehAksi(peran, 'seleksi_karya')) return { ok: false, alasan: 'Hanya Editor dan Admin yang boleh membuka kontak.' };
  try {
    const [k] = await db.select({ tahap: karya.tahap, kontak: karya.kontakTerenkripsi }).from(karya).where(eq(karya.id, id));
    if (!k) return { ok: false, alasan: 'Karya tidak ditemukan.' };
    if (k.tahap !== 'dihubungi' && k.tahap !== 'dikembalikan') {
      return { ok: false, alasan: 'Kontak hanya dibuka setelah karya dinyatakan layak atau dikembalikan.' };
    }
    if (!k.kontak) return { ok: false, alasan: 'Kontak sudah dihapus sesuai kebijakan retensi (30 hari).' };
    const data = JSON.parse(dekripsiKontak(k.kontak, kunci)) as { kontak: string; namaLengkap?: string | null; sekolah?: string | null };
    await catatAudit(db, { peran, aksi: 'baca_kontak_karya', objek: 'karya', objekId: id });
    return { ok: true, kontak: data.kontak, namaLengkap: data.namaLengkap ?? null, sekolah: data.sekolah ?? null };
  } catch {
    return { ok: false, alasan: 'Kontak tidak bisa dibuka. Cek kunci enkripsi di server.' };
  }
}
