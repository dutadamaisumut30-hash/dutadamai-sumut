// Layanan kirim karya ke database. Validasi, verifikasi Turnstile, lalu simpan dengan kontak terenkripsi.
// Dipisah dari server action agar bisa diuji dengan database PGlite.
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { karya } from '@/lib/db/schema';
import { enkripsiKontak } from '@/lib/kripto-kontak';
import { skemaKirimKarya } from './kirim';
import { catatAudit } from '@/lib/audit';

export type HasilKirim = { ok: true; kode: string } | { ok: false; pesan: string };

export interface DepsKirim {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: PgDatabase<any, any, any>;
  kunci: Buffer;
  secretTurnstile: string;
  cekTurnstile: (opsi: { token: string; secret: string; ip?: string }) => Promise<boolean>;
  buatKode: () => string;
}

export async function layananKirimKarya(
  input: unknown,
  opsi: { turnstile: string; ip?: string },
  deps: DepsKirim,
): Promise<HasilKirim> {
  const hasil = skemaKirimKarya.safeParse(input);
  if (!hasil.success) {
    return { ok: false, pesan: hasil.error.issues[0]?.message ?? 'Data belum lengkap.' };
  }
  const data = hasil.data;

  // Penyimpanan berkas belum ada (PENYIMPANAN_DRIVER lokal belum disiapkan). Desain ditolak, bukan diterima diam-diam.
  if (data.jenis === 'desain') {
    return { ok: false, pesan: 'Penyimpanan berkas desain belum tersedia. Kirim tulisan dulu, atau coba lagi nanti.' };
  }

  const lolos = await deps.cekTurnstile({ token: opsi.turnstile, secret: deps.secretTurnstile, ip: opsi.ip });
  if (!lolos) {
    return { ok: false, pesan: 'Verifikasi keamanan gagal. Muat ulang halaman lalu coba lagi.' };
  }

  const kode = deps.buatKode();
  const bundel = JSON.stringify({ kontak: data.kontak, namaLengkap: data.namaLengkap ?? null, sekolah: data.sekolah ?? null });

  try {
    await deps.db.insert(karya).values({
      kodeLacak: kode,
      jenis: data.jenis,
      judul: data.judul,
      isi: data.isi,
      oleh: data.namaPanggung,
      tahap: 'antrean',
      kontakTerenkripsi: enkripsiKontak(bundel, deps.kunci),
    });
  } catch {
    return { ok: false, pesan: 'Karyamu belum tersimpan. Coba lagi beberapa saat lagi.' };
  }
  await catatAudit(deps.db, { peran: 'publik', aksi: 'kirim_karya', objek: 'karya', objekId: kode });
  return { ok: true, kode };
}
