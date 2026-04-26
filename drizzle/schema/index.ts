import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

// Enums
export const providerEnum = pgEnum("provider", ["email", "google", "apple"]);
export const localeEnum = pgEnum("locale", ["lt", "en"]);
export const audienceEnum = pgEnum("audience", [
	"romantic",
	"family",
	"kids",
	"friends",
]);
export const questionStatusEnum = pgEnum("question_status", [
	"draft",
	"published",
]);
export const cardStatusEnum = pgEnum("card_status", ["draft", "published"]);
export const planEnum = pgEnum("plan", ["free", "monthly", "yearly"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
	"active",
	"canceled",
	"past_due",
	"trialing",
	"expired",
]);
export const progressStatusEnum = pgEnum("progress_status", [
	"answered",
	"skipped",
	"superliked",
]);
export const eventTypeEnum = pgEnum("event_type", [
	"viewed",
	"skipped",
	"answered",
	"superliked",
	"spicy_dismissed",
]);
export const categoryTypeEnum = pgEnum("category_type", ["safe", "intimate"]);
export const submissionStatusEnum = pgEnum("submission_status", [
	"pending",
	"approved",
	"rejected",
]);
export const rarityEnum = pgEnum("rarity", [
	"rare",
	"medium",
	"frequent",
	"ultra",
]);
export const reminderFrequencyEnum = pgEnum("reminder_frequency", [
	"daily",
	"weekly",
	"off",
]);

// =====================
// SYSTEM
// =====================

export const users = pgTable("users", {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	email: text("email").notNull().unique(),
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	passwordHash: text("password_hash").notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =====================
// PLAYERS
// =====================

export const players = pgTable("players", {
	activeCategories: jsonb("active_categories").$type<string[]>(),
	avatar: text("avatar"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	currentStreak: integer("current_streak").default(0),
	email: text("email").notNull().unique(),
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	lastPlayedDate: text("last_played_date"),
	locale: localeEnum("locale").default("lt"),
	longestStreak: integer("longest_streak").default(0),
	name: text("name"),
	passwordHash: text("password_hash"),
	preferredAudience: audienceEnum("preferred_audience"),
	provider: providerEnum("provider").default("email"),
	providerId: text("provider_id"),
	spicySettingsEnabled: boolean("spicy_settings_enabled").default(true),
	spicySettingsEnabledTypes: jsonb("spicy_settings_enabled_types").$type<
		string[]
	>(),
	spicySettingsRarity: rarityEnum("spicy_settings_rarity").default("medium"),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =====================
// SUBSCRIPTIONS
// =====================

export const subscriptions = pgTable("subscriptions", {
	cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	currentPeriodEnd: timestamp("current_period_end"),
	currentPeriodStart: timestamp("current_period_start"),
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	plan: planEnum("plan").default("free"),
	playerId: integer("player_id")
		.notNull()
		.references(() => players.id, { onDelete: "cascade" })
		.unique(),
	status: subscriptionStatusEnum("status").default("active"),
	stripeCustomerId: text("stripe_customer_id").notNull(),
	stripeSubscriptionId: text("stripe_subscription_id"),
	trialEnd: timestamp("trial_end"),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =====================
// CONTENT
// =====================

export const categories = pgTable("categories", {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	locale: localeEnum("locale").default("lt"),
	name: text("name").notNull().unique(),
	sortOrder: integer("sort_order").notNull(),
	type: categoryTypeEnum("type").notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
	audience: audienceEnum("audience").default("romantic").notNull(),
	categoryId: integer("category_id")
		.references(() => categories.id, { onDelete: "cascade" })
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	legacyId: integer("legacy_id"),
	locale: localeEnum("locale").default("lt"),
	question: text("question").notNull(),
	status: questionStatusEnum("status").default("published").notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const spicyCardTypes = pgTable("spicy_card_types", {
	color: text("color").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	icon: text("icon").notNull(),
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	label: text("label").notNull(),
	locale: localeEnum("locale").default("lt"),
	slug: text("slug").notNull().unique(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const spicyCards = pgTable("spicy_cards", {
	audience: audienceEnum("audience").default("romantic").notNull(),
	cardTypeId: integer("card_type_id")
		.references(() => spicyCardTypes.id, { onDelete: "cascade" })
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	description: text("description").notNull(),
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	locale: localeEnum("locale").default("lt"),
	status: cardStatusEnum("status").default("published").notNull(),
	title: text("title").notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const audiences = pgTable("audiences", {
	color: text("color").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	description: text("description").notNull(),
	icon: text("icon").notNull(),
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	isActive: boolean("is_active").default(true),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	sortOrder: integer("sort_order").default(0),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dailyQuestions = pgTable("daily_questions", {
	audience: audienceEnum("audience").default("romantic").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	date: text("date").notNull().unique(), // YYYY-MM-DD
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	questionId: integer("question_id")
		.references(() => questions.id, { onDelete: "cascade" })
		.notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const questionSubmissions = pgTable("question_submissions", {
	audience: audienceEnum("audience").default("romantic").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	moderatorNote: text("moderator_note"),
	status: submissionStatusEnum("status").default("pending"),
	submittedBy: integer("submitted_by").references(() => players.id, {
		onDelete: "set null",
	}),
	text: text("text").notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =====================
// ANALYTICS
// =====================

export const playerProgress = pgTable(
	"player_progress",
	{
		audience: audienceEnum("audience").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		playerId: integer("player_id")
			.references(() => players.id, { onDelete: "cascade" })
			.notNull(),
		questionId: integer("question_id").notNull(),
		status: progressStatusEnum("status").notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
		viewedAt: timestamp("viewed_at").defaultNow().notNull(),
	},
	(t) => [
		uniqueIndex("pp_player_question_audience_unique").on(
			t.playerId,
			t.questionId,
			t.audience,
		),
	],
);

export const gameSessions = pgTable("game_sessions", {
	audience: audienceEnum("audience"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	device: text("device"),
	duration: integer("duration"), // seconds
	endedAt: timestamp("ended_at"),
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	locale: localeEnum("locale"),
	pairedSessionId: integer("paired_session_id").references(
		() => pairedSessions.id,
		{ onDelete: "set null" },
	),
	playerId: integer("player_id").references(() => players.id, {
		onDelete: "set null",
	}),
	playerRole: text("player_role", { enum: ["initiator", "partner"] }),
	questionsSkipped: integer("questions_skipped").default(0),
	questionsViewed: integer("questions_viewed").default(0),
	sessionId: text("session_id").notNull().unique(),
	spicyCardsViewed: integer("spicy_cards_viewed").default(0),
	startedAt: timestamp("started_at").notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const questionEvents = pgTable(
	"question_events",
	{
		createdAt: timestamp("created_at").defaultNow().notNull(),
		eventType: eventTypeEnum("event_type").notNull(),
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		questionId: integer("question_id").notNull(),
		sessionId: text("session_id").notNull(),
		timeSpent: integer("time_spent"),
		timestamp: timestamp("timestamp").notNull(),
	},
	(t) => [
		index("qe_question_id_idx").on(t.questionId),
		index("qe_event_type_idx").on(t.eventType),
		index("qe_session_id_idx").on(t.sessionId),
		index("qe_question_event_idx").on(t.questionId, t.eventType),
	],
);

// =====================
// PAIRED SESSIONS
// =====================

export const pairedSessions = pgTable(
	"paired_sessions",
	{
		audience: audienceEnum("audience").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		initiatorPlayerId: integer("initiator_player_id")
			.notNull()
			.references(() => players.id, { onDelete: "cascade" }),
		inviteToken: text("invite_token").notNull().unique(),
		locale: localeEnum("locale").notNull(),
		partnerPlayerId: integer("partner_player_id").references(() => players.id, {
			onDelete: "set null",
		}),
		status: text("status", {
			enum: ["pending", "active", "completed"],
		})
			.notNull()
			.default("pending"),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => [index("ps_initiator_idx").on(t.initiatorPlayerId)],
);

// =====================
// PUSH SUBSCRIPTIONS
// =====================

export const pushSubscriptions = pgTable(
	"push_subscriptions",
	{
		auth: text("auth").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		endpoint: text("endpoint").notNull(),
		frequency: reminderFrequencyEnum("frequency").default("daily").notNull(),
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		locale: localeEnum("locale").default("lt").notNull(),
		p256dh: text("p256dh").notNull(),
		playerId: integer("player_id")
			.notNull()
			.references(() => players.id, { onDelete: "cascade" }),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => [
		uniqueIndex("push_subs_player_endpoint_unique").on(t.playerId, t.endpoint),
	],
);

// =====================
// BILLING
// =====================

export const stripeEvents = pgTable("stripe_events", {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	eventId: text("event_id").notNull().unique(),
	eventType: text("event_type").notNull(),
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type SpicyCardType = typeof spicyCardTypes.$inferSelect;
export type SpicyCard = typeof spicyCards.$inferSelect;
export type Audience = typeof audiences.$inferSelect;
export type DailyQuestion = typeof dailyQuestions.$inferSelect;
export type QuestionSubmission = typeof questionSubmissions.$inferSelect;
export type PlayerProgressRecord = typeof playerProgress.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
export type QuestionEvent = typeof questionEvents.$inferSelect;
export type StripeEvent = typeof stripeEvents.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type PairedSession = typeof pairedSessions.$inferSelect;
