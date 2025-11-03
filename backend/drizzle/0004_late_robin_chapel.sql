ALTER TABLE "user" ADD COLUMN "lender_category_tier" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lender_rating_tier" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lender_capacity_tier" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lender_geographic_scope" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lender_internal_category" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lender_internal_rating" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lender_internal_capacity" real;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lender_internal_available_capacity" real;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "lender_category";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "lender_rating";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "total_capacity";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "available_capacity";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "geographic_focus";