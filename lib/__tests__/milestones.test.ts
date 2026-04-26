import { describe, expect, it } from "vitest";
import { detectNewMilestones } from "../milestones";

describe("detectNewMilestones", () => {
	it("returns empty array when no milestones are reached", () => {
		const hits = detectNewMilestones(
			{ bestStreak: 0, totalAnswered: 0 },
			new Set(),
		);
		expect(hits).toEqual([]);
	});

	it("detects question milestone at 10", () => {
		const hits = detectNewMilestones(
			{ bestStreak: 0, totalAnswered: 10 },
			new Set(),
		);
		expect(hits).toHaveLength(1);
		expect(hits[0]).toMatchObject({
			id: "q10",
			threshold: 10,
			type: "questions",
		});
	});

	it("detects all question milestones when answered >= 100", () => {
		const hits = detectNewMilestones(
			{ bestStreak: 0, totalAnswered: 100 },
			new Set(),
		);
		const questionHits = hits.filter((h) => h.type === "questions");
		expect(questionHits).toHaveLength(3);
		expect(questionHits.map((h) => h.threshold)).toEqual([10, 50, 100]);
	});

	it("skips milestones already in seenIds", () => {
		const hits = detectNewMilestones(
			{ bestStreak: 0, totalAnswered: 100 },
			new Set(["q10", "q50"]),
		);
		const questionHits = hits.filter((h) => h.type === "questions");
		expect(questionHits).toHaveLength(1);
		expect(questionHits[0].threshold).toBe(100);
	});

	it("detects streak milestone at 7", () => {
		const hits = detectNewMilestones(
			{ bestStreak: 7, totalAnswered: 0 },
			new Set(),
		);
		expect(hits).toHaveLength(1);
		expect(hits[0]).toMatchObject({ id: "s7", threshold: 7, type: "streak" });
	});

	it("detects both streak milestones at bestStreak >= 30", () => {
		const hits = detectNewMilestones(
			{ bestStreak: 30, totalAnswered: 0 },
			new Set(),
		);
		const streakHits = hits.filter((h) => h.type === "streak");
		expect(streakHits).toHaveLength(2);
		expect(streakHits.map((h) => h.threshold)).toEqual([7, 30]);
	});

	it("returns empty when all milestones already seen", () => {
		const seen = new Set(["q10", "q50", "q100", "s7", "s30"]);
		const hits = detectNewMilestones(
			{ bestStreak: 30, totalAnswered: 100 },
			seen,
		);
		expect(hits).toHaveLength(0);
	});

	it("does not trigger question milestone when just below threshold", () => {
		const hits = detectNewMilestones(
			{ bestStreak: 0, totalAnswered: 9 },
			new Set(),
		);
		expect(hits.filter((h) => h.type === "questions")).toHaveLength(0);
	});
});
