CREATE TABLE "laporan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alasan" text NOT NULL,
	"catatan" text DEFAULT '' NOT NULL,
	"alamat" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'baru' NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tulisan" ADD COLUMN "penulis_id" text;--> statement-breakpoint
CREATE INDEX "laporan_status_idx" ON "laporan" USING btree ("status");