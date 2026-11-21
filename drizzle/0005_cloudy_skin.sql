ALTER TABLE "berkas" ADD COLUMN "karya_id" uuid;--> statement-breakpoint
ALTER TABLE "berkas" ADD CONSTRAINT "berkas_karya_id_karya_id_fk" FOREIGN KEY ("karya_id") REFERENCES "public"."karya"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "berkas_karya_idx" ON "berkas" USING btree ("karya_id");