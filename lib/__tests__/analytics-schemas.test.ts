import { describe, expect, it } from "vitest";
import {
	ACTION_TO_STATUS,
	analyticsBodySchema,
	analyticsEventSchema,
	analyticsSessionSchema,
	swipeActionSchema,
} from "../schemas";

const BASE_EVENT = {
	eventType: "viewed" as const,
	questionId: 1,
	sessionId: "session-abc",
	timestamp: "2026-04-26T00:00:00.000Z",
};

const BASE_SESSION = {
	questionsSkipped: 2,
	questionsViewed: 10,
	sessionId: "session-xyz",
	spicyCardsViewed: 1,
	startedAt: "2026-04-26T00:00:00.000Z",
};

describe("analyticsEventSchema", () => {
	it("accepts a valid event", () => {
		expect(analyticsEventSchema.safeParse(BASE_EVENT).success).toBe(true);
	});

	it("accepts a string questionId", () => {
		expect(
			analyticsEventSchema.safeParse({ ...BASE_EVENT, questionId: "q-42" })
				.success,
		).toBe(true);
	});

	it.each([
		"viewed",
		"skipped",
		"answered",
		"superliked",
		"spicy_dismissed",
	])("accepts event type '%s'", (eventType) => {
		expect(
			analyticsEventSchema.safeParse({ ...BASE_EVENT, eventType }).success,
		).toBe(true);
	});

	it("rejects an unknown event type", () => {
		expect(
			analyticsEventSchema.safeParse({ ...BASE_EVENT, eventType: "clicked" })
				.success,
		).toBe(false);
	});

	it("rejects missing sessionId", () => {
		const { sessionId: _removed, ...noSession } = BASE_EVENT;
		expect(analyticsEventSchema.safeParse(noSession).success).toBe(false);
	});

	it("rejects empty sessionId", () => {
		expect(
			analyticsEventSchema.safeParse({ ...BASE_EVENT, sessionId: "" }).success,
		).toBe(false);
	});

	it("accepts timeSpent = 0", () => {
		expect(
			analyticsEventSchema.safeParse({ ...BASE_EVENT, timeSpent: 0 }).success,
		).toBe(true);
	});

	it("accepts timeSpent = 3600", () => {
		expect(
			analyticsEventSchema.safeParse({ ...BASE_EVENT, timeSpent: 3600 })
				.success,
		).toBe(true);
	});

	it("rejects timeSpent > 3600", () => {
		expect(
			analyticsEventSchema.safeParse({ ...BASE_EVENT, timeSpent: 3601 })
				.success,
		).toBe(false);
	});

	it("rejects negative timeSpent", () => {
		expect(
			analyticsEventSchema.safeParse({ ...BASE_EVENT, timeSpent: -1 }).success,
		).toBe(false);
	});

	it("rejects fractional timeSpent", () => {
		expect(
			analyticsEventSchema.safeParse({ ...BASE_EVENT, timeSpent: 1.5 }).success,
		).toBe(false);
	});

	it("accepts event without timeSpent", () => {
		expect(analyticsEventSchema.safeParse(BASE_EVENT).success).toBe(true);
	});
});

describe("analyticsSessionSchema", () => {
	it("accepts a valid session", () => {
		expect(analyticsSessionSchema.safeParse(BASE_SESSION).success).toBe(true);
	});

	it.each([
		"romantic",
		"family",
		"kids",
		"friends",
	])("accepts audience '%s'", (audience) => {
		expect(
			analyticsSessionSchema.safeParse({ ...BASE_SESSION, audience }).success,
		).toBe(true);
	});

	it("rejects invalid audience", () => {
		expect(
			analyticsSessionSchema.safeParse({
				...BASE_SESSION,
				audience: "strangers",
			}).success,
		).toBe(false);
	});

	it.each(["lt", "en"])("accepts locale '%s'", (locale) => {
		expect(
			analyticsSessionSchema.safeParse({ ...BASE_SESSION, locale }).success,
		).toBe(true);
	});

	it("rejects invalid locale", () => {
		expect(
			analyticsSessionSchema.safeParse({ ...BASE_SESSION, locale: "fr" })
				.success,
		).toBe(false);
	});

	it("rejects negative questionsViewed", () => {
		expect(
			analyticsSessionSchema.safeParse({
				...BASE_SESSION,
				questionsViewed: -1,
			}).success,
		).toBe(false);
	});

	it("rejects questionsSkipped above limit", () => {
		expect(
			analyticsSessionSchema.safeParse({
				...BASE_SESSION,
				questionsSkipped: 100_001,
			}).success,
		).toBe(false);
	});

	it("rejects missing sessionId", () => {
		const { sessionId: _removed, ...noId } = BASE_SESSION;
		expect(analyticsSessionSchema.safeParse(noId).success).toBe(false);
	});

	it("allows optional device field", () => {
		expect(
			analyticsSessionSchema.safeParse({ ...BASE_SESSION, device: undefined })
				.success,
		).toBe(true);
	});

	it("rejects device longer than 500 chars", () => {
		expect(
			analyticsSessionSchema.safeParse({
				...BASE_SESSION,
				device: "x".repeat(501),
			}).success,
		).toBe(false);
	});

	it("accepts device of exactly 500 chars", () => {
		expect(
			analyticsSessionSchema.safeParse({
				...BASE_SESSION,
				device: "x".repeat(500),
			}).success,
		).toBe(true);
	});
});

describe("analyticsBodySchema", () => {
	it("accepts an empty events array", () => {
		expect(analyticsBodySchema.safeParse({ events: [] }).success).toBe(true);
	});

	it("accepts events without a session", () => {
		expect(
			analyticsBodySchema.safeParse({ events: [BASE_EVENT] }).success,
		).toBe(true);
	});

	it("accepts exactly 100 events", () => {
		const events = Array.from({ length: 100 }, () => BASE_EVENT);
		expect(analyticsBodySchema.safeParse({ events }).success).toBe(true);
	});

	it("rejects more than 100 events", () => {
		const events = Array.from({ length: 101 }, () => BASE_EVENT);
		expect(analyticsBodySchema.safeParse({ events }).success).toBe(false);
	});

	it("accepts events with an optional session", () => {
		expect(
			analyticsBodySchema.safeParse({
				events: [BASE_EVENT],
				session: BASE_SESSION,
			}).success,
		).toBe(true);
	});
});

describe("ACTION_TO_STATUS", () => {
	it("maps skip → skipped", () => {
		expect(ACTION_TO_STATUS.skip).toBe("skipped");
	});

	it("maps answer → answered", () => {
		expect(ACTION_TO_STATUS.answer).toBe("answered");
	});

	it("maps superlike → superliked", () => {
		expect(ACTION_TO_STATUS.superlike).toBe("superliked");
	});
});

describe("swipeActionSchema", () => {
	const BASE_SWIPE = {
		action: "skip" as const,
		audience: "romantic" as const,
		questionId: 42,
	};

	it("accepts a valid swipe", () => {
		expect(swipeActionSchema.safeParse(BASE_SWIPE).success).toBe(true);
	});

	it.each(["skip", "answer", "superlike"])("accepts action '%s'", (action) => {
		expect(swipeActionSchema.safeParse({ ...BASE_SWIPE, action }).success).toBe(
			true,
		);
	});

	it("rejects unknown action", () => {
		expect(
			swipeActionSchema.safeParse({ ...BASE_SWIPE, action: "like" }).success,
		).toBe(false);
	});

	it.each([
		"romantic",
		"family",
		"kids",
		"friends",
	])("accepts audience '%s'", (audience) => {
		expect(
			swipeActionSchema.safeParse({ ...BASE_SWIPE, audience }).success,
		).toBe(true);
	});

	it("rejects invalid audience", () => {
		expect(
			swipeActionSchema.safeParse({ ...BASE_SWIPE, audience: "coworkers" })
				.success,
		).toBe(false);
	});

	it("rejects questionId = 0", () => {
		expect(
			swipeActionSchema.safeParse({ ...BASE_SWIPE, questionId: 0 }).success,
		).toBe(false);
	});

	it("rejects negative questionId", () => {
		expect(
			swipeActionSchema.safeParse({ ...BASE_SWIPE, questionId: -1 }).success,
		).toBe(false);
	});
});
