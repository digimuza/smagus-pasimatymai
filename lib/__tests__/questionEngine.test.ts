import { describe, expect, it } from "vitest";
import type { Question, QuestionState, Section } from "@/types";
import {
	getAvailableQuestions,
	getAvailableQuestionsCount,
	getCategoryQuestionCount,
	getNextQuestion,
	getPreviewQuestions,
	getQuestionSection,
	getQuestionsByCategories,
	getRandomQuestion,
	getSuperlikedQuestions,
} from "../questionEngine";

function q(id: number): Question {
	return { id, question: `Question ${id}` };
}

function state(id: number, status: QuestionState["status"]): QuestionState {
	return { id, status };
}

function section(name: string, ids: number[]): Section {
	return { name, questions: ids.map(q), range: "1-10", type: "safe" };
}

// ---------------------------------------------------------------------------
// getQuestionsByCategories
// ---------------------------------------------------------------------------
describe("getQuestionsByCategories", () => {
	const sections = [
		section("love", [1, 2, 3]),
		section("trust", [4, 5]),
		section("fun", [6]),
	];

	it("returns questions from a single active category", () => {
		const result = getQuestionsByCategories(sections, ["love"]);
		expect(result.map((x) => x.id)).toEqual([1, 2, 3]);
	});

	it("returns questions from multiple active categories", () => {
		const result = getQuestionsByCategories(sections, ["love", "fun"]);
		expect(result.map((x) => x.id)).toEqual([1, 2, 3, 6]);
	});

	it("returns empty array when no categories match", () => {
		expect(getQuestionsByCategories(sections, ["unknown"])).toHaveLength(0);
	});

	it("returns empty array for empty sections list", () => {
		expect(getQuestionsByCategories([], ["love"])).toHaveLength(0);
	});

	it("returns empty array for empty active categories", () => {
		expect(getQuestionsByCategories(sections, [])).toHaveLength(0);
	});
});

// ---------------------------------------------------------------------------
// getAvailableQuestions
// ---------------------------------------------------------------------------
describe("getAvailableQuestions", () => {
	const questions = [q(1), q(2), q(3), q(4), q(5)];

	it("returns all questions when no states exist", () => {
		expect(getAvailableQuestions(questions, [])).toHaveLength(5);
	});

	it("excludes answered questions", () => {
		const result = getAvailableQuestions(questions, [state(1, "answered")]);
		expect(result.map((x) => x.id)).not.toContain(1);
		expect(result).toHaveLength(4);
	});

	it("excludes superliked questions", () => {
		const result = getAvailableQuestions(questions, [state(2, "superliked")]);
		expect(result.map((x) => x.id)).not.toContain(2);
		expect(result).toHaveLength(4);
	});

	it("does not exclude skipped questions", () => {
		const result = getAvailableQuestions(questions, [state(3, "skipped")]);
		expect(result).toHaveLength(5);
	});

	it("excludes multiple answered and superliked questions", () => {
		const states = [
			state(1, "answered"),
			state(2, "superliked"),
			state(3, "answered"),
		];
		const result = getAvailableQuestions(questions, states);
		expect(result.map((x) => x.id)).toEqual([4, 5]);
	});

	it("returns empty array when all questions are excluded", () => {
		const states = questions.map((x) => state(x.id, "answered"));
		expect(getAvailableQuestions(questions, states)).toHaveLength(0);
	});

	it("handles states for questions not in the list", () => {
		const result = getAvailableQuestions(questions, [state(99, "answered")]);
		expect(result).toHaveLength(5);
	});
});

// ---------------------------------------------------------------------------
// getSuperlikedQuestions — core super likes / favorites
// ---------------------------------------------------------------------------
describe("getSuperlikedQuestions", () => {
	const allQuestions = [q(1), q(2), q(3), q(4)];

	it("returns empty array when no questions are superliked", () => {
		expect(getSuperlikedQuestions(allQuestions, [])).toHaveLength(0);
	});

	it("returns only superliked questions", () => {
		const states = [state(1, "superliked"), state(2, "answered")];
		const result = getSuperlikedQuestions(allQuestions, states);
		expect(result.map((x) => x.id)).toEqual([1]);
	});

	it("returns multiple superliked questions", () => {
		const states = [
			state(1, "superliked"),
			state(3, "superliked"),
			state(2, "skipped"),
		];
		const result = getSuperlikedQuestions(allQuestions, states);
		expect(result.map((x) => x.id)).toEqual([1, 3]);
	});

	it("does not include answered questions", () => {
		const states = [state(2, "answered"), state(4, "answered")];
		expect(getSuperlikedQuestions(allQuestions, states)).toHaveLength(0);
	});

	it("does not include skipped questions", () => {
		expect(
			getSuperlikedQuestions(allQuestions, [state(1, "skipped")]),
		).toHaveLength(0);
	});

	it("returns empty array when all questions are answered", () => {
		const states = allQuestions.map((x) => state(x.id, "answered"));
		expect(getSuperlikedQuestions(allQuestions, states)).toHaveLength(0);
	});

	it("ignores states for unknown question ids", () => {
		const result = getSuperlikedQuestions(allQuestions, [
			state(99, "superliked"),
		]);
		expect(result).toHaveLength(0);
	});

	it("unfavorite: superliked then answered removes from favorites list", () => {
		const states = [state(1, "answered")]; // downgraded from superliked
		const result = getSuperlikedQuestions(allQuestions, states);
		expect(result.map((x) => x.id)).not.toContain(1);
	});
});

// ---------------------------------------------------------------------------
// getRandomQuestion
// ---------------------------------------------------------------------------
describe("getRandomQuestion", () => {
	it("returns null for empty array", () => {
		expect(getRandomQuestion([])).toBeNull();
	});

	it("returns the single item when array has one element", () => {
		expect(getRandomQuestion([q(42)])).toEqual(q(42));
	});

	it("returns an item from the array", () => {
		const pool = [q(1), q(2), q(3)];
		const result = getRandomQuestion(pool);
		expect(pool).toContainEqual(result);
	});
});

// ---------------------------------------------------------------------------
// getNextQuestion
// ---------------------------------------------------------------------------
describe("getNextQuestion", () => {
	const sections = [section("love", [1, 2, 3]), section("trust", [4, 5])];

	it("returns null when activeCategories is empty", () => {
		expect(getNextQuestion(sections, [], [])).toBeNull();
	});

	it("returns null when all category questions are consumed", () => {
		const states = [1, 2, 3].map((id) => state(id, "answered"));
		expect(getNextQuestion(sections, ["love"], states)).toBeNull();
	});

	it("returns null for empty sections", () => {
		expect(getNextQuestion([], ["love"], [])).toBeNull();
	});

	it("returns a question from the active category pool", () => {
		const result = getNextQuestion(sections, ["love"], []);
		expect([1, 2, 3]).toContain(result?.id);
	});

	it("does not return questions from inactive categories", () => {
		const result = getNextQuestion(sections, ["love"], []);
		expect([4, 5]).not.toContain(result?.id);
	});

	it("skips answered questions", () => {
		const states = [state(1, "answered"), state(2, "answered")];
		const result = getNextQuestion(sections, ["love"], states);
		expect(result?.id).toBe(3);
	});
});

// ---------------------------------------------------------------------------
// getQuestionSection
// ---------------------------------------------------------------------------
describe("getQuestionSection", () => {
	const sections = [section("love", [1, 2]), section("trust", [3, 4])];

	it("returns null for an unknown question id", () => {
		expect(getQuestionSection(sections, 999)).toBeNull();
	});

	it("returns the correct section for a question", () => {
		expect(getQuestionSection(sections, 1)?.name).toBe("love");
		expect(getQuestionSection(sections, 3)?.name).toBe("trust");
	});

	it("returns null for empty sections", () => {
		expect(getQuestionSection([], 1)).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// getAvailableQuestionsCount
// ---------------------------------------------------------------------------
describe("getAvailableQuestionsCount", () => {
	const sections = [section("love", [1, 2, 3]), section("trust", [4, 5])];

	it("counts all questions when no progress", () => {
		expect(getAvailableQuestionsCount(sections, ["love", "trust"], [])).toBe(5);
	});

	it("subtracts answered and superliked", () => {
		const states = [state(1, "answered"), state(4, "superliked")];
		expect(
			getAvailableQuestionsCount(sections, ["love", "trust"], states),
		).toBe(3);
	});

	it("returns 0 when all are consumed", () => {
		const states = [1, 2, 3].map((id) => state(id, "answered"));
		expect(getAvailableQuestionsCount(sections, ["love"], states)).toBe(0);
	});
});

// ---------------------------------------------------------------------------
// getCategoryQuestionCount
// ---------------------------------------------------------------------------
describe("getCategoryQuestionCount", () => {
	const sections = [section("love", [1, 2, 3]), section("trust", [4, 5])];

	it("returns count for existing category", () => {
		expect(getCategoryQuestionCount(sections, "love")).toBe(3);
		expect(getCategoryQuestionCount(sections, "trust")).toBe(2);
	});

	it("returns 0 for unknown category", () => {
		expect(getCategoryQuestionCount(sections, "unknown")).toBe(0);
	});
});

// ---------------------------------------------------------------------------
// getPreviewQuestions
// ---------------------------------------------------------------------------
describe("getPreviewQuestions", () => {
	const sections = [section("love", [1, 2, 3, 4, 5])];

	it("returns up to count available questions", () => {
		const result = getPreviewQuestions(sections, ["love"], [], 0, 3);
		expect(result).toHaveLength(3);
	});

	it("excludes the given questionId", () => {
		const result = getPreviewQuestions(sections, ["love"], [], 1, 10);
		expect(result.map((x) => x.id)).not.toContain(1);
	});

	it("excludes answered and superliked from preview", () => {
		const states = [state(2, "answered"), state(3, "superliked")];
		const result = getPreviewQuestions(sections, ["love"], states, 1, 10);
		const ids = result.map((x) => x.id);
		expect(ids).not.toContain(2);
		expect(ids).not.toContain(3);
	});

	it("returns empty array when all questions exhausted", () => {
		const states = [1, 2, 3, 4, 5].map((id) => state(id, "answered"));
		expect(getPreviewQuestions(sections, ["love"], states, 0, 10)).toHaveLength(
			0,
		);
	});
});
