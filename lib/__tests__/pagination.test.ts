import { describe, expect, it } from "vitest";
import type { Section } from "@/types";
import {
	mergeQuestionsIntoSections,
	PREFETCH_THRESHOLD,
	shouldFetchNextPage,
} from "../pagination";

function section(
	name: string,
	ids: number[],
	type: "safe" | "intimate" = "safe",
): Section {
	return {
		name,
		questions: ids.map((id) => ({ id, question: `Q${id}` })),
		range: `${ids.length} klausimų`,
		type,
	};
}

// ---------------------------------------------------------------------------
// shouldFetchNextPage
// ---------------------------------------------------------------------------
describe("shouldFetchNextPage", () => {
	it("returns true when below threshold with more available and not fetching", () => {
		expect(shouldFetchNextPage(PREFETCH_THRESHOLD - 1, true, false)).toBe(true);
	});

	it("returns false when no more pages available", () => {
		expect(shouldFetchNextPage(5, false, false)).toBe(false);
	});

	it("returns false when already fetching", () => {
		expect(shouldFetchNextPage(5, true, true)).toBe(false);
	});

	it("returns false when available count equals the threshold", () => {
		expect(shouldFetchNextPage(PREFETCH_THRESHOLD, true, false)).toBe(false);
	});

	it("returns false when above threshold", () => {
		expect(shouldFetchNextPage(PREFETCH_THRESHOLD + 5, true, false)).toBe(
			false,
		);
	});

	it("returns true when available count is zero and more pages exist", () => {
		expect(shouldFetchNextPage(0, true, false)).toBe(true);
	});

	it("returns false when all three conditions block", () => {
		expect(shouldFetchNextPage(0, false, true)).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// mergeQuestionsIntoSections
// ---------------------------------------------------------------------------
describe("mergeQuestionsIntoSections", () => {
	it("appends new questions to the correct section", () => {
		const sections = [section("love", [1, 2]), section("trust", [3])];
		const result = mergeQuestionsIntoSections(sections, [
			{ categoryName: "love", id: 4, question: "Q4" },
		]);
		expect(
			result.find((s) => s.name === "love")?.questions.map((q) => q.id),
		).toEqual([1, 2, 4]);
	});

	it("distributes questions to multiple sections correctly", () => {
		const sections = [section("love", [1]), section("trust", [2])];
		const result = mergeQuestionsIntoSections(sections, [
			{ categoryName: "love", id: 3, question: "Q3" },
			{ categoryName: "trust", id: 4, question: "Q4" },
		]);
		expect(
			result.find((s) => s.name === "love")?.questions.map((q) => q.id),
		).toEqual([1, 3]);
		expect(
			result.find((s) => s.name === "trust")?.questions.map((q) => q.id),
		).toEqual([2, 4]);
	});

	it("does not duplicate questions already present", () => {
		const sections = [section("love", [1, 2])];
		const result = mergeQuestionsIntoSections(sections, [
			{ categoryName: "love", id: 1, question: "Q1-dup" },
		]);
		expect(result[0].questions.filter((q) => q.id === 1)).toHaveLength(1);
		expect(result[0].questions).toHaveLength(2);
	});

	it("ignores questions whose categoryName does not match any section", () => {
		const sections = [section("love", [1])];
		const result = mergeQuestionsIntoSections(sections, [
			{ categoryName: "unknown", id: 5, question: "Q5" },
		]);
		expect(result[0].questions).toHaveLength(1);
	});

	it("returns sections unchanged when incoming is empty", () => {
		const sections = [section("love", [1, 2])];
		const result = mergeQuestionsIntoSections(sections, []);
		expect(result[0].questions.map((q) => q.id)).toEqual([1, 2]);
	});

	it("does not mutate the original sections array", () => {
		const sections = [section("love", [1])];
		const originalLength = sections[0].questions.length;
		mergeQuestionsIntoSections(sections, [
			{ categoryName: "love", id: 2, question: "Q2" },
		]);
		expect(sections[0].questions).toHaveLength(originalLength);
	});

	it("preserves sections that received no incoming questions", () => {
		const sections = [section("love", [1]), section("trust", [2, 3])];
		const result = mergeQuestionsIntoSections(sections, [
			{ categoryName: "love", id: 4, question: "Q4" },
		]);
		expect(
			result.find((s) => s.name === "trust")?.questions.map((q) => q.id),
		).toEqual([2, 3]);
	});
});
