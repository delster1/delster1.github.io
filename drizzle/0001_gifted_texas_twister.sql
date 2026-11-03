ALTER TABLE "sessions" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;