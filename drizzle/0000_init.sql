CREATE TYPE "public"."jenis_karya" AS ENUM('tulisan', 'desain');--> statement-breakpoint
CREATE TYPE "public"."kategori_saran" AS ENUM('Saran konten', 'Masalah teknis', 'Ide kolaborasi');--> statement-breakpoint
CREATE TYPE "public"."peran" AS ENUM('blogger', 'dkv', 'editor', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status_komentar" AS ENUM('menunggu', 'tampil', 'disembunyikan');--> statement-breakpoint
CREATE TYPE "public"."status_saran" AS ENUM('baru', 'dibaca', 'ditindak', 'diarsip');--> statement-breakpoint
CREATE TYPE "public"."status_tulisan" AS ENUM('draf', 'menunggu_desain', 'didesain', 'review_akhir', 'terbit');--> statement-breakpoint
CREATE TYPE "public"."tahap_karya" AS ENUM('formulir', 'antrean', 'keputusan', 'dihubungi', 'dikembalikan', 'terbit', 'ditolak');--> statement-breakpoint
CREATE TABLE "anggota_tim" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" text NOT NULL,
	"peran" text NOT NULL,
	"divisi" text NOT NULL,
	"tampil" boolean DEFAULT true NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "karya" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jenis" "jenis_karya" NOT NULL,
	"judul" text NOT NULL,
	"oleh" text NOT NULL,
	"tahap" "tahap_karya" DEFAULT 'formulir' NOT NULL,
	"catatan" text,
	"kontak_terenkripsi" text,
	"kontak_hapus_pada" timestamp with time zone,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "komentar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tulisan_id" uuid NOT NULL,
	"nama_pengirim" text NOT NULL,
	"isi" text NOT NULL,
	"status" "status_komentar" DEFAULT 'menunggu' NOT NULL,
	"laporan" integer DEFAULT 0 NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "log_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"peran" text NOT NULL,
	"aksi" text NOT NULL,
	"objek" text NOT NULL,
	"objek_id" text,
	"catatan" text,
	"pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rubrik" (
	"slug" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"deskripsi" text NOT NULL,
	CONSTRAINT "rubrik_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "saran" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kategori" "kategori_saran" NOT NULL,
	"pesan" text NOT NULL,
	"kontak_terenkripsi" text,
	"status" "status_saran" DEFAULT 'baru' NOT NULL,
	"diterima_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tulisan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"judul" text NOT NULL,
	"rubrik_slug" text NOT NULL,
	"status" "status_tulisan" DEFAULT 'draf' NOT NULL,
	"penanggung" text[] DEFAULT '{}' NOT NULL,
	"tenggat" date NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	"diperbarui" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tulisan_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "komentar" ADD CONSTRAINT "komentar_tulisan_id_tulisan_id_fk" FOREIGN KEY ("tulisan_id") REFERENCES "public"."tulisan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tulisan" ADD CONSTRAINT "tulisan_rubrik_slug_rubrik_slug_fk" FOREIGN KEY ("rubrik_slug") REFERENCES "public"."rubrik"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "karya_tahap_idx" ON "karya" USING btree ("tahap");--> statement-breakpoint
CREATE INDEX "karya_kontak_hapus_idx" ON "karya" USING btree ("kontak_hapus_pada");--> statement-breakpoint
CREATE INDEX "komentar_tulisan_idx" ON "komentar" USING btree ("tulisan_id");--> statement-breakpoint
CREATE INDEX "komentar_status_idx" ON "komentar" USING btree ("status");--> statement-breakpoint
CREATE INDEX "saran_status_idx" ON "saran" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tulisan_status_idx" ON "tulisan" USING btree ("status");