CREATE TYPE "public"."reminder_frequency" AS ENUM('daily', 'weekly', 'off');

CREATE TABLE "push_subscriptions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "push_subscriptions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"endpoint" text NOT NULL,
	"frequency" "reminder_frequency" DEFAULT 'daily' NOT NULL,
	"locale" "locale" DEFAULT 'lt' NOT NULL,
	"p256dh" text NOT NULL,
	"player_id" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;

CREATE UNIQUE INDEX "push_subs_player_endpoint_unique" ON "push_subscriptions" USING btree ("player_id","endpoint");
