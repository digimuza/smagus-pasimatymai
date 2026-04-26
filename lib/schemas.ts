import { z } from "zod";

const VALID_EVENT_TYPES = [
	"viewed",
	"skipped",
	"answered",
	"superliked",
	"spicy_dismissed",
] as const;

const VALID_AUDIENCES = ["romantic", "family", "kids", "friends"] as const;
const VALID_LOCALES = ["lt", "en"] as const;
const VALID_STATUSES = ["answered", "skipped", "superliked"] as const;

export const analyticsEventSchema = z.object({
	eventType: z.enum(VALID_EVENT_TYPES),
	questionId: z.union([z.number(), z.string()]),
	sessionId: z.string().min(1),
	timeSpent: z.number().int().min(0).max(3600).optional(),
	timestamp: z.string().min(1),
});

export const analyticsSessionSchema = z.object({
	audience: z.enum(VALID_AUDIENCES).optional(),
	device: z.string().max(500).optional(),
	endedAt: z.string().optional(),
	locale: z.enum(VALID_LOCALES).optional(),
	questionsSkipped: z.number().int().min(0).max(100000),
	questionsViewed: z.number().int().min(0).max(100000),
	sessionId: z.string().min(1),
	spicyCardsViewed: z.number().int().min(0).max(100000),
	startedAt: z.string().min(1),
});

export const analyticsBodySchema = z.object({
	events: z.array(analyticsEventSchema).max(100),
	session: analyticsSessionSchema.optional(),
});

export const progressItemSchema = z.object({
	audience: z.enum(VALID_AUDIENCES),
	questionId: z.number().int().positive(),
	status: z.enum(VALID_STATUSES),
	viewedAt: z.string().optional(),
});

export const progressBodySchema = z.object({
	items: z.array(progressItemSchema).min(1).max(200),
});

export const checkoutBodySchema = z.object({
	plan: z.enum(["monthly", "yearly"]),
});

export const submitQuestionSchema = z.object({
	audience: z.enum(VALID_AUDIENCES),
	text: z.string().trim().min(10).max(300),
});

// left=skip, right=answer, up=superlike
const VALID_SWIPE_ACTIONS = ["skip", "answer", "superlike"] as const;

export const swipeActionSchema = z.object({
	action: z.enum(VALID_SWIPE_ACTIONS),
	audience: z.enum(VALID_AUDIENCES),
	questionId: z.number().int().positive(),
	timestamp: z.string().optional(),
});

const VALID_FREQUENCIES = ["daily", "weekly", "off"] as const;

export const pushSubscribeSchema = z.object({
	auth: z.string().min(1),
	endpoint: z.string().url(),
	frequency: z.enum(VALID_FREQUENCIES),
	locale: z.enum(VALID_LOCALES).optional(),
	p256dh: z.string().min(1),
});

export const pushFrequencyUpdateSchema = z.object({
	frequency: z.enum(VALID_FREQUENCIES),
});

export const ACTION_TO_STATUS = {
	answer: "answered",
	skip: "skipped",
	superlike: "superliked",
} as const satisfies Record<
	(typeof VALID_SWIPE_ACTIONS)[number],
	(typeof VALID_STATUSES)[number]
>;
