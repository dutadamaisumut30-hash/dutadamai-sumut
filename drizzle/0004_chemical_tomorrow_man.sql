CREATE TABLE "berkas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tulisan_id" uuid,
	"nama_asli" text NOT NULL,
	"jenis_mime" text NOT NULL,
	"ukuran" integer NOT NULL,
	"lokasi" text NOT NULL,
	"diunggah_oleh" text NOT NULL,
	"pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "berkas_lokasi_unique" UNIQUE("lokasi")
);
--> statement-breakpoint
ALTER TABLE "berkas" ADD CONSTRAINT "berkas_tulisan_id_tulisan_id_fk" FOREIGN KEY ("tulisan_id") REFERENCES "public"."tulisan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "berkas_tulisan_idx" ON "berkas" USING btree ("tulisan_id");