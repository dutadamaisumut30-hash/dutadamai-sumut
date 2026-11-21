// Skema database. Nilai enum disalin dari modul domain dan dijaga sama oleh tes
// (tests/unit/skema-db.test.ts), supaya drizzle-kit bisa dijalankan tanpa alias '@/'.
import { sql } from 'drizzle-orm';
import {
  boolean, date, index, integer, pgEnum, pgTable, text, timestamp, uuid,
} from 'drizzle-orm/pg-core';

export const PERAN_TIM = ['blogger', 'dkv', 'editor', 'admin'] as const;
export const STATUS_TULISAN = ['draf', 'menunggu_desain', 'didesain', 'review_akhir', 'terbit'] as const;
export const TAHAP_KARYA = ['formulir', 'antrean', 'keputusan', 'dihubungi', 'dikembalikan', 'terbit', 'ditolak'] as const;
export const STATUS_KOMENTAR = ['menunggu', 'tampil', 'disembunyikan'] as const;
export const STATUS_SARAN = ['baru', 'dibaca', 'ditindak', 'diarsip'] as const;
export const KATEGORI_SARAN = ['Saran konten', 'Masalah teknis', 'Ide kolaborasi'] as const;
export const JENIS_KARYA = ['tulisan', 'desain'] as const;

export const peranEnum = pgEnum('peran', PERAN_TIM);
export const statusTulisanEnum = pgEnum('status_tulisan', STATUS_TULISAN);
export const tahapKaryaEnum = pgEnum('tahap_karya', TAHAP_KARYA);
export const statusKomentarEnum = pgEnum('status_komentar', STATUS_KOMENTAR);
export const statusSaranEnum = pgEnum('status_saran', STATUS_SARAN);
export const kategoriSaranEnum = pgEnum('kategori_saran', KATEGORI_SARAN);
export const jenisKaryaEnum = pgEnum('jenis_karya', JENIS_KARYA);

export const rubrik = pgTable('rubrik', {
  slug: text('slug').primaryKey(),
  nama: text('nama').notNull().unique(),
  deskripsi: text('deskripsi').notNull(),
});

export const anggotaTim = pgTable('anggota_tim', {
  id: uuid('id').primaryKey().defaultRandom(),
  nama: text('nama').notNull(),
  peran: text('peran').notNull(),
  divisi: text('divisi').notNull(),
  tampil: boolean('tampil').notNull().default(true),
  urutan: integer('urutan').notNull().default(0),
  dibuatPada: timestamp('dibuat_pada', { withTimezone: true }).notNull().defaultNow(),
});

export const tulisan = pgTable('tulisan', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  judul: text('judul').notNull(),
  /** Isi tulisan dalam paragraf, dipisah baris kosong. */
  isi: text('isi').notNull().default(''),
  rubrikSlug: text('rubrik_slug').notNull().references(() => rubrik.slug),
  status: statusTulisanEnum('status').notNull().default('draf'),
  penanggung: text('penanggung').array().notNull().default(sql`'{}'`),
  tenggat: date('tenggat').notNull(),
  dibuatPada: timestamp('dibuat_pada', { withTimezone: true }).notNull().defaultNow(),
  diperbarui: timestamp('diperbarui', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('tulisan_status_idx').on(t.status)]);

export const karya = pgTable('karya', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Kode lacak yang diberikan ke pengirim. Dipakai halaman lacak. */
  kodeLacak: text('kode_lacak').notNull().unique(),
  jenis: jenisKaryaEnum('jenis').notNull(),
  judul: text('judul').notNull(),
  /** Isi tulisan. Kosong untuk desain. */
  isi: text('isi'),
  oleh: text('oleh').notNull(),
  tahap: tahapKaryaEnum('tahap').notNull().default('formulir'),
  catatan: text('catatan'),
  /** Kontak, nama lengkap, dan sekolah dalam bentuk JSON terenkripsi (ADR 005). Kunci: KONTAK_ENCRYPTION_KEY. */
  kontakTerenkripsi: text('kontak_terenkripsi'),
  /** Tanggal kontak dihapus. Diisi saat keputusan final (ADR 005). */
  kontakHapusPada: timestamp('kontak_hapus_pada', { withTimezone: true }),
  dibuatPada: timestamp('dibuat_pada', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('karya_tahap_idx').on(t.tahap),
  index('karya_kontak_hapus_idx').on(t.kontakHapusPada),
]);

export const komentar = pgTable('komentar', {
  id: uuid('id').primaryKey().defaultRandom(),
  tulisanId: uuid('tulisan_id').notNull().references(() => tulisan.id, { onDelete: 'cascade' }),
  namaPengirim: text('nama_pengirim').notNull(),
  isi: text('isi').notNull(),
  status: statusKomentarEnum('status').notNull().default('menunggu'),
  laporan: integer('laporan').notNull().default(0),
  dibuatPada: timestamp('dibuat_pada', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('komentar_tulisan_idx').on(t.tulisanId), index('komentar_status_idx').on(t.status)]);

export const saran = pgTable('saran', {
  id: uuid('id').primaryKey().defaultRandom(),
  kategori: kategoriSaranEnum('kategori').notNull(),
  pesan: text('pesan').notNull(),
  kontakTerenkripsi: text('kontak_terenkripsi'),
  status: statusSaranEnum('status').notNull().default('baru'),
  diterimaPada: timestamp('diterima_pada', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('saran_status_idx').on(t.status)]);

/** Catatan aksi tim (memori proyek: log audit). Hanya ditambah, tidak diubah atau dihapus. */
export const logAudit = pgTable('log_audit', {
  id: uuid('id').primaryKey().defaultRandom(),
  peran: text('peran').notNull(),
  aksi: text('aksi').notNull(),
  objek: text('objek').notNull(),
  objekId: text('objek_id'),
  catatan: text('catatan'),
  pada: timestamp('pada', { withTimezone: true }).notNull().defaultNow(),
});

/** Berkas desain yang diunggah DKV (kartu, cover) untuk tulisan. Isi berkas disimpan di folder penyimpanan, bukan di database. */
export const berkas = pgTable('berkas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tulisanId: uuid('tulisan_id').references(() => tulisan.id, { onDelete: 'cascade' }),
  /** Berkas desain karya publik. Satu berkas hanya milik tulisan atau karya, tidak keduanya. */
  karyaId: uuid('karya_id').references(() => karya.id, { onDelete: 'cascade' }),
  namaAsli: text('nama_asli').notNull(),
  jenisMime: text('jenis_mime').notNull(),
  ukuran: integer('ukuran').notNull(),
  lokasi: text('lokasi').notNull().unique(),
  diunggahOleh: text('diunggah_oleh').notNull(),
  pada: timestamp('pada', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('berkas_tulisan_idx').on(t.tulisanId), index('berkas_karya_idx').on(t.karyaId)]);

// Tabel Better Auth (login, sesi, 2FA). Dibuat dengan @better-auth/cli, jangan diedit tangan.
export * from './auth';
