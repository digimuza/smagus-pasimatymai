import { describe, expect, it } from "vitest";
import {
	canAccessAudience,
	canAccessSpicyCards,
	getQuestionLimit,
	isPremium,
	limitQuestions,
} from "../subscription";

describe("isPremium", () => {
	it("returns false for null", () => {
		expect(isPremium(null)).toBe(false);
	});

	it("returns false for undefined", () => {
		expect(isPremium(undefined)).toBe(false);
	});

	it("returns true for active monthly", () => {
		expect(isPremium({ plan: "monthly", status: "active" })).toBe(true);
	});

	it("returns true for active yearly", () => {
		expect(isPremium({ plan: "yearly", status: "active" })).toBe(true);
	});

	it("returns true for trialing monthly", () => {
		expect(isPremium({ plan: "monthly", status: "trialing" })).toBe(true);
	});

	it("returns true for trialing yearly", () => {
		expect(isPremium({ plan: "yearly", status: "trialing" })).toBe(true);
	});

	it("returns false for canceled monthly", () => {
		expect(isPremium({ plan: "monthly", status: "canceled" })).toBe(false);
	});

	it("returns false for free plan", () => {
		expect(isPremium({ plan: "free", status: "active" })).toBe(false);
	});

	it("returns false for expired yearly", () => {
		expect(isPremium({ plan: "yearly", status: "expired" })).toBe(false);
	});

	it("returns false for past_due", () => {
		expect(isPremium({ plan: "monthly", status: "past_due" })).toBe(false);
	});
});

describe("canAccessAudience", () => {
	it("allows romantic for free users (null)", () => {
		expect(canAccessAudience("romantic", null)).toBe(true);
	});

	it("allows romantic for free users (undefined)", () => {
		expect(canAccessAudience("romantic", undefined)).toBe(true);
	});

	it("blocks family for free users", () => {
		expect(canAccessAudience("family", null)).toBe(false);
	});

	it("blocks kids for free users", () => {
		expect(canAccessAudience("kids", null)).toBe(false);
	});

	it("blocks friends for free users", () => {
		expect(canAccessAudience("friends", null)).toBe(false);
	});

	it("allows family for premium users", () => {
		expect(
			canAccessAudience("family", { plan: "monthly", status: "active" }),
		).toBe(true);
	});

	it("allows all audiences for premium", () => {
		const sub = { plan: "yearly", status: "active" };
		expect(canAccessAudience("romantic", sub)).toBe(true);
		expect(canAccessAudience("family", sub)).toBe(true);
		expect(canAccessAudience("kids", sub)).toBe(true);
		expect(canAccessAudience("friends", sub)).toBe(true);
	});
});

describe("canAccessSpicyCards", () => {
	it("returns false for free users", () => {
		expect(canAccessSpicyCards(null)).toBe(false);
	});

	it("returns true for premium users", () => {
		expect(
			canAccessSpicyCards({ plan: "monthly", status: "active" }),
		).toBe(true);
	});
});

describe("getQuestionLimit", () => {
	it("returns 50 for free users", () => {
		expect(getQuestionLimit(null)).toBe(50);
	});

	it("returns Infinity for premium users", () => {
		expect(
			getQuestionLimit({ plan: "monthly", status: "active" }),
		).toBe(Infinity);
	});
});

describe("limitQuestions", () => {
	const questions = Array.from({ length: 100 }, (_, i) => i);

	it("limits to 50 for free users", () => {
		expect(limitQuestions(questions, null)).toHaveLength(50);
	});

	it("returns all for premium users", () => {
		expect(
			limitQuestions(questions, { plan: "yearly", status: "active" }),
		).toHaveLength(100);
	});

	it("handles empty array", () => {
		expect(limitQuestions([], null)).toHaveLength(0);
	});

	it("handles array smaller than limit", () => {
		const small = [1, 2, 3];
		expect(limitQuestions(small, null)).toHaveLength(3);
	});
});
