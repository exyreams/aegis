ALTER TABLE "user" ADD COLUMN "lender_category" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lender_rating" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_capacity" real;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "available_capacity" real;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "active_loans" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "default_rate" real DEFAULT 0.01;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "average_interest_rate" real;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "geographic_focus" text DEFAULT 'Global';