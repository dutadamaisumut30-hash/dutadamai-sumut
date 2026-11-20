import { and, desc, eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { karya, rubrik, tulisan } from '@/lib/db/schema';
import type { KaryaContoh } from '@/lib/data-contoh';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

export interface TulisanPublik {
  slug: string;
  judul: string;
  ringkasan: string;
  rubrik: string;
  rubrikSlug: string;
  penulis: string;
  menitBaca: number;
  tanggalTampil: string;
  warna: Warna;
  isi: string[];
}

type Warna = 'ph-warm' | 'ph-blue' | 'ph-rose' | '';
const WARNA: Warna[] = ['ph-warm', 'ph-blue', 'ph-rose', ''];

function paragraf(isi: string): string[] {
  return isi.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
}

function ringkas(teks: string, maks = 160): string {
  if (teks.length <= maks) return teks;
  return teks.slice(0, maks).replace(/\s+\S*$/, '') + '…';
}

function tanggal(d: Date): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(d);
}

/** Tulisan yang sudah terbit, terbaru dulu. Filter rubrik opsional. */
export async function ambilTulisanTerbit(db: Db, rubrikSlug?: string): Promise<TulisanPublik[]> {
  const kondisi = rubrikSlug
    ? and(eq(tulisan.status, 'terbit'), eq(tulisan.rubrikSlug, rubrikSlug))
    : eq(tulisan.status, 'terbit');
  const baris = await db
    .select({
      slug: tulisan.slug,
      judul: tulisan.judul,
      isi: tulisan.isi,
      penanggung: tulisan.penanggung,
      diperbarui: tulisan.diperbarui,
      rubrikSlug: tulisan.rubrikSlug,
      rubrikNama: rubrik.nama,
    })
    .from(tulisan)
    .innerJoin(rubrik, eq(tulisan.rubrikSlug, rubrik.slug))
    .where(kondisi)
    .orderBy(desc(tulisan.diperbarui));

  return baris.map((b: any, i: number) => {
    const par = paragraf(b.isi);
    const kata = b.isi.split(/\s+/).filter(Boolean).length;
    return {
      slug: b.slug,
      judul: b.judul,
      ringkasan: ringkas(par[0] ?? b.judul),
      rubrik: b.rubrikNama,
      rubrikSlug: b.rubrikSlug,
      penulis: b.penanggung.join(', ') || 'Redaksi',
      menitBaca: Math.max(1, Math.round(kata / 200)),
      tanggalTampil: tanggal(b.diperbarui),
      warna: WARNA[i % WARNA.length],
      isi: par,
    };
  });
}

/** Karya yang sudah terbit (tahap 'terbit'). */
export async function ambilKaryaTerbit(db: Db): Promise<KaryaContoh[]> {
  const baris = await db
    .select({ id: karya.id, jenis: karya.jenis, judul: karya.judul, oleh: karya.oleh, isi: karya.isi })
    .from(karya)
    .where(eq(karya.tahap, 'terbit'));

  return baris.map((b: any, i: number) => ({
    id: b.id,
    jenis: b.jenis as 'tulisan' | 'desain',
    judul: b.judul,
    oleh: b.oleh,
    kutipan: b.jenis === 'tulisan' && b.isi ? ringkas(paragraf(b.isi)[0] ?? b.isi, 140) : undefined,
    warna: WARNA[i % WARNA.length],
  }));
}
