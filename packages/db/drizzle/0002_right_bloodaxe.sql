ALTER TABLE "user" ADD COLUMN "completions_used_this_month" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "whitelisted";