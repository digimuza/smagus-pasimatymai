import { describe, expect, it } from "vitest";
import {
	computeResults,
	generateInviteToken,
	isTokenExpired,
} from "../pairedSession";

describe("generateInviteToken", () => {
	it("returns a non-empty string", () => {
		expect(generateInviteToken().length).toBeGreaterThan(0);
	});

	it("produces URL-safe characters only", () => {
		for (let i = 0; i < 20; i++) {
			expect(generateInviteToken()).toMatch(/^[A-Za-z0-9_-]+$/);
		}
	});

	it("produces unique tokens each call", () => {
		const tokens = new Set(Array.from({ length: 100 }, generateInviteToken));
		expect(tokens.size).toBe(100);
	});
});

describe("isTokenExpired", () => {
	it("returns true for a past date", () => {
		expect(isTokenExpired(new Date(Date.now() - 1000))).toBe(true);
	});

	it("returns false for a future date", () => {
		expect(isTokenExpired(new Date(Date.now() + 60_000))).toBe(false);
	});
});

describe("computeResults", () => {
	const questions = [
		{ id: 1, question: "Question 1" },
		{ id: 2, question: "Question 2" },
		{ id: 3, question: "Question 3" },
		{ id: 4, question: "Question 4" },
	];

	it("classifies both-positive as agreed", () => {
		const my = [{ questionId: 1, status: "answered" as const }];
		const partner = [{ questionId: 1, status: "answered" as const }];
		const { agreed, bothSkipped, disagreed } = computeResults(
			my,
			partner,
			questions,
		);
		expect(agreed).toHaveLength(1);
		expect(agreed[0].questionId).toBe(1);
		expect(bothSkipped).toHaveLength(0);
		expect(disagreed).toHaveLength(0);
	});

	it("classifies answered+superliked as agreed", () => {
		const my = [{ questionId: 2, status: "answered" as const }];
		const partner = [{ questionId: 2, status: "superliked" as const }];
		const { agreed } = computeResults(my, partner, questions);
		expect(agreed).toHaveLength(1);
	});

	it("classifies both skipped as bothSkipped", () => {
		const my = [{ questionId: 3, status: "skipped" as const }];
		const partner = [{ questionId: 3, status: "skipped" as const }];
		const { bothSkipped, disagreed } = computeResults(my, partner, questions);
		expect(bothSkipped).toHaveLength(1);
		expect(disagreed).toHaveLength(0);
	});

	it("classifies answered+skipped as disagreed", () => {
		const my = [{ questionId: 4, status: "answered" as const }];
		const partner = [{ questionId: 4, status: "skipped" as const }];
		const { disagreed } = computeResults(my, partner, questions);
		expect(disagreed).toHaveLength(1);
		expect(disagreed[0].myStatus).toBe("answered");
		expect(disagreed[0].partnerStatus).toBe("skipped");
	});

	it("skips questions the partner has not interacted with", () => {
		const my = [
			{ questionId: 1, status: "answered" as const },
			{ questionId: 2, status: "answered" as const },
		];
		const partner = [{ questionId: 1, status: "answered" as const }];
		const { agreed } = computeResults(my, partner, questions);
		expect(agreed).toHaveLength(1);
	});

	it("attaches question text when available", () => {
		const my = [{ questionId: 1, status: "answered" as const }];
		const partner = [{ questionId: 1, status: "superliked" as const }];
		const { agreed } = computeResults(my, partner, questions);
		expect(agreed[0].questionText).toBe("Question 1");
	});

	it("sets questionText to null for unknown question IDs", () => {
		const my = [{ questionId: 99, status: "answered" as const }];
		const partner = [{ questionId: 99, status: "answered" as const }];
		const { agreed } = computeResults(my, partner, []);
		expect(agreed[0].questionText).toBeNull();
	});

	it("returns empty results when both progress arrays are empty", () => {
		const { agreed, bothSkipped, disagreed } = computeResults([], [], questions);
		expect(agreed).toHaveLength(0);
		expect(bothSkipped).toHaveLength(0);
		expect(disagreed).toHaveLength(0);
	});
});
