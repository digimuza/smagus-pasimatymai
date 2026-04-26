import { describe, expect, it } from "vitest";
import {
	ACTION_TO_STATUS,
	progressBodySchema,
	progressItemSchema,
	swipeActionSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// swipeActionSchema
// ---------------------------------------------------------------------------
describe("swipeActionSchema", () => {
	it("accepts a valid skip action", () => {
		const result = swipeActionSchema.safeParse({
			action: "skip",
			audience: "romantic",
			questionId: 1,
		});
		expect(result.success).toBe(true);
	});

	it("accepts a valid answer action", () => {
		const result = swipeActionSchema.safeParse({
			action: "answer",
			audience: "family",
			questionId: 42,
		});
		expect(result.success).toBe(true);
	});

	it("accepts a valid superlike action", () => {
		const result = swipeActionSchema.safeParse({
			action: "superlike",
			audience: "romantic",
			questionId: 7,
		});
		expect(result.success).toBe(true);
	});

	it("accepts optional timestamp", () => {
		const result = swipeActionSchema.safeParse({
			action: "superlike",
			audience: "romantic",
			questionId: 7,
			timestamp: "2026-04-26T10:00:00Z",
		});
		expect(result.success).toBe(true);
	});

	it("rejects unknown action", () => {
		const result = swipeActionSchema.safeParse({
			action: "heart",
			audience: "romantic",
			questionId: 1,
		});
		expect(result.success).toBe(false);
	});

	it("rejects unknown audience", () => {
		const result = swipeActionSchema.safeParse({
			action: "superlike",
			audience: "strangers",
			questionId: 1,
		});
		expect(result.success).toBe(false);
	});

	it("rejects non-positive questionId", () => {
		const result = swipeActionSchema.safeParse({
			action: "superlike",
			audience: "romantic",
			questionId: 0,
		});
		expect(result.success).toBe(false);
	});

	it("rejects missing required fields", () => {
		expect(swipeActionSchema.safeParse({ action: "superlike" }).success).toBe(
			false,
		);
	});
});

// ---------------------------------------------------------------------------
// ACTION_TO_STATUS — superlike maps to superliked
// ---------------------------------------------------------------------------
describe("ACTION_TO_STATUS", () => {
	it("maps superlike to superliked", () => {
		expect(ACTION_TO_STATUS.superlike).toBe("superliked");
	});

	it("maps answer to answered", () => {
		expect(ACTION_TO_STATUS.answer).toBe("answered");
	});

	it("maps skip to skipped", () => {
		expect(ACTION_TO_STATUS.skip).toBe("skipped");
	});
});

// ---------------------------------------------------------------------------
// progressItemSchema
// ---------------------------------------------------------------------------
describe("progressItemSchema", () => {
	it("accepts a valid superliked progress item", () => {
		const result = progressItemSchema.safeParse({
			audience: "romantic",
			questionId: 5,
			status: "superliked",
		});
		expect(result.success).toBe(true);
	});

	it("accepts optional viewedAt", () => {
		const result = progressItemSchema.safeParse({
			audience: "romantic",
			questionId: 5,
			status: "superliked",
			viewedAt: "2026-04-26T10:00:00Z",
		});
		expect(result.success).toBe(true);
	});

	it("accepts answered and skipped statuses", () => {
		expect(
			progressItemSchema.safeParse({
				audience: "family",
				questionId: 1,
				status: "answered",
			}).success,
		).toBe(true);

		expect(
			progressItemSchema.safeParse({
				audience: "kids",
				questionId: 2,
				status: "skipped",
			}).success,
		).toBe(true);
	});

	it("rejects invalid status", () => {
		const result = progressItemSchema.safeParse({
			audience: "romantic",
			questionId: 5,
			status: "new",
		});
		expect(result.success).toBe(false);
	});

	it("rejects non-positive questionId", () => {
		const result = progressItemSchema.safeParse({
			audience: "romantic",
			questionId: -1,
			status: "superliked",
		});
		expect(result.success).toBe(false);
	});

	it("rejects invalid audience", () => {
		const result = progressItemSchema.safeParse({
			audience: "coworkers",
			questionId: 1,
			status: "superliked",
		});
		expect(result.success).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// progressBodySchema — batch upsert validation
// ---------------------------------------------------------------------------
describe("progressBodySchema", () => {
	const validItem = {
		audience: "romantic",
		questionId: 1,
		status: "superliked",
	};

	it("accepts a single valid item", () => {
		const result = progressBodySchema.safeParse({ items: [validItem] });
		expect(result.success).toBe(true);
	});

	it("rejects empty items array", () => {
		const result = progressBodySchema.safeParse({ items: [] });
		expect(result.success).toBe(false);
	});

	it("rejects more than 200 items", () => {
		const items = Array.from({ length: 201 }, (_, i) => ({
			...validItem,
			questionId: i + 1,
		}));
		const result = progressBodySchema.safeParse({ items });
		expect(result.success).toBe(false);
	});

	it("accepts exactly 200 items", () => {
		const items = Array.from({ length: 200 }, (_, i) => ({
			...validItem,
			questionId: i + 1,
		}));
		const result = progressBodySchema.safeParse({ items });
		expect(result.success).toBe(true);
	});
});
