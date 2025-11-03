ALTER TABLE "user" ADD COLUMN "lender_anonymous_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_lender_anonymous_id_unique" UNIQUE("lender_anonymous_id");