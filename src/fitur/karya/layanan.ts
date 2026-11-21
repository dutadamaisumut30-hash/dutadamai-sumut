// Layanan kirim karya ke database. Validasi, verifikasi Turnstile, lalu simpan dengan kontak terenkripsi.
// Dipisah dari server action agar bisa diuji dengan database PGlite.
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { berkas, karya } from '@/lib/db/schema';
import { enkripsiKontak } from '@/lib/kripto-kontak';
import { skemaKirimKarya } from './kirim';
import { catatAudit } from '@/lib/audit';
import { validasiBerkas } from '@/fitur/berkas/validasi';
import { hapusMetadataGambar } from '@/lib/metadata-gambar';
import { hapusBerkas, simpanBerkas } from '@/lib/penyimpanan';

export const MIME_KARYA = ['image/jpeg', 'image/png'] as const;
export const BATAS_BERKAS_KARYA = 5 * 1024 * 1024;

export type HasilKirim = { ok: true; kode: string } | { ok: false; pesan: string };

export interface BerkasKirim {
  nama: string;
  mime: string;
  isi: Buffer;
}

export interface DepsKirim {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: PgDatabase<any, any, any>;
  kunci: Buffer;
  secretTurnstile: string;
  cekTurnstile: (opsi: { token: string; secret: string; ip?: string }) => Promise<boolean>;
  buatKode: () => string;
  /** Penyimpanan berkas. Dipisah agar tes bisa memakai penyimpanan palsu. */
  simpanFile?: (isi: Buffer, mime: string) => Promise<string>;
  hapusFile?: (lokasi: string) => Promise<void>;
}

export async function layananKirimKarya(
  input: unknown,
  opsi: { turnstile: string; ip?: string; berkas?: BerkasKirim | null },
  deps: DepsKirim,
): Promise<HasilKirim> {
  const hasil = skemaKirimKarya.safeParse(input);
  if (!hasil.success) {
    return { ok: false, pesan: hasil.error.issues[0]?.message ?? 'Data belum lengkap.' };
  }
  const data = hasil.data;

  let berkasKirim: BerkasKirim | null = null;
  if (data.jenis === 'desain') {
    if (!opsi.berkas) return { ok: false, pesan: 'Unggah berkas desainmu dulu.' };
    const salah = validasiBerkas({ mime: opsi.berkas.mime, isi: opsi.berkas.isi, mimeIzin: MIME_KARYA, batasByte: BATAS_BERKAS_KARYA });
    if (salah) return { ok: false, pesan: salah };
    const bersih = hapusMetadataGambar(opsi.berkas.isi, opsi.berkas.mime);
    if (!bersih) return { ok: false, pesan: 'Isi berkas tidak bisa dibaca. Pastikan gambarnya tidak rusak.' };
    berkasKirim = { ...opsi.berkas, isi: bersih };
  }

  const lolos = await deps.cekTurnstile({ token: opsi.turnstile, secret: deps.secretTurnstile, ip: opsi.ip });
  if (!lolos) {
    return { ok: false, pesan: 'Verifikasi keamanan gagal. Muat ulang halaman lalu coba lagi.' };
  }

  const kode = deps.buatKode();
  const bundel = JSON.stringify({ kontak: data.kontak, namaLengkap: data.namaLengkap ?? null, sekolah: data.sekolah ?? null });
  const kontakTerenkripsi = enkripsiKontak(bundel, deps.kunci);

  let lokasi: string | null = null;
  try {
    if (berkasKirim) lokasi = await (deps.simpanFile ?? simpanBerkas)(berkasKirim.isi, berkasKirim.mime);
    const berkasSimpan = berkasKirim;
    const lokasiSimpan = lokasi;
    await deps.db.transaction(async (tx) => {
      const [baru] = await tx
        .insert(karya)
        .values({
          kodeLacak: kode,
          jenis: data.jenis,
          judul: data.judul,
          isi: data.isi,
          oleh: data.namaPanggung,
          tahap: 'antrean',
          kontakTerenkripsi,
        })
        .returning({ id: karya.id });
      if (berkasSimpan && lokasiSimpan) {
        await tx.insert(berkas).values({
          karyaId: baru.id,
          namaAsli: berkasSimpan.nama.slice(0, 200),
          jenisMime: berkasSimpan.mime,
          ukuran: berkasSimpan.isi.length,
          lokasi: lokasiSimpan,
          diunggahOleh: 'publik',
        });
      }
    });
  } catch {
    if (lokasi) await (deps.hapusFile ?? hapusBerkas)(lokasi);
    return { ok: false, pesan: 'Karyamu belum tersimpan. Coba lagi beberapa saat lagi.' };
  }
  await catatAudit(deps.db, { peran: 'publik', aksi: 'kirim_karya', objek: 'karya', objekId: kode });
  return { ok: true, kode };
}
