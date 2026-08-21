CREATE TABLE "email_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_verifications_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "iw_gateway_api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"key_hash" varchar(64) NOT NULL,
	"key_prefix" varchar(10) NOT NULL,
	"name" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "iw_gateway_api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "iw_gateway_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer,
	"provider" varchar(50) DEFAULT 'anthropic' NOT NULL,
	"model_requested" varchar(100) NOT NULL,
	"model_used" varchar(100) NOT NULL,
	"model_baseline" varchar(100) NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cache_read_tokens" integer DEFAULT 0 NOT NULL,
	"cost_usd" numeric(12, 6) DEFAULT '0' NOT NULL,
	"baseline_cost_usd" numeric(12, 6) DEFAULT '0' NOT NULL,
	"savings_usd" numeric(12, 6) DEFAULT '0' NOT NULL,
	"ttft_ms" integer,
	"total_ms" integer,
	"from_cache" boolean DEFAULT false NOT NULL,
	"used_fallback" boolean DEFAULT false NOT NULL,
	"optimizations" json DEFAULT '[]'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "iw_provider_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"provider" varchar(50) NOT NULL,
	"key_hint" varchar(20) NOT NULL,
	"key_enc" text NOT NULL,
	"base_url" text,
	"name" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "iw_provider_keys_team_id_provider_unique" UNIQUE("team_id","provider")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iw_gateway_api_keys" ADD CONSTRAINT "iw_gateway_api_keys_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iw_gateway_requests" ADD CONSTRAINT "iw_gateway_requests_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iw_provider_keys" ADD CONSTRAINT "iw_provider_keys_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;