ALTER TABLE "karya" ADD COLUMN "kode_lacak" text NOT NULL;--> statement-breakpoint
ALTER TABLE "karya" ADD COLUMN "isi" text;--> statement-breakpoint
ALTER TABLE "karya" ADD CONSTRAINT "karya_kode_lacak_unique" UNIQUE("kode_lacak");