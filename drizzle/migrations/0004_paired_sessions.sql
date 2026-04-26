CREATE TYPE "public"."reminder_frequency" AS ENUM('daily', 'weekly', 'off');--> statement-breakpoint
CREATE TABLE "paired_sessions" (
	"audience" "audience" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "paired_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"initiator_player_id" integer NOT NULL,
	"invite_token" text NOT NULL,
	"locale" "locale" NOT NULL,
	"partner_player_id" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "paired_sessions_invite_token_unique" UNIQUE("invite_token")
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"endpoint" text NOT NULL,
	"frequency" "reminder_frequency" DEFAULT 'daily' NOT NULL,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "push_subscriptions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"locale" "locale" DEFAULT 'lt' NOT NULL,
	"p256dh" text NOT NULL,
	"player_id" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "paired_session_id" integer;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "player_role" text;--> statement-breakpoint
ALTER TABLE "paired_sessions" ADD CONSTRAINT "paired_sessions_initiator_player_id_players_id_fk" FOREIGN KEY ("initiator_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paired_sessions" ADD CONSTRAINT "paired_sessions_partner_player_id_players_id_fk" FOREIGN KEY ("partner_player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ps_initiator_idx" ON "paired_sessions" USING btree ("initiator_player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "push_subs_player_endpoint_unique" ON "push_subscriptions" USING btree ("player_id","endpoint");--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_paired_session_id_paired_sessions_id_fk" FOREIGN KEY ("paired_session_id") REFERENCES "public"."paired_sessions"("id") ON DELETE set null ON UPDATE no action;