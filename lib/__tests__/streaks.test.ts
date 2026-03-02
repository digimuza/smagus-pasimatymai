import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { calculateStreak } from "../streaks";

describe("calculateStreak", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("starts a new streak from scratch", () => {
		vi.setSystemTime(new Date("2026-03-01T12:00:00Z"));
		const result = calculateStreak({});

		expect(result.currentStreak).toBe(1);
		expect(result.lastPlayedDate).toBe("2026-03-01");
		expect(result.longestStreak).toBe(1);
	});

	it("does not change streak if played today", () => {
		vi.setSystemTime(new Date("2026-03-01T18:00:00Z"));
		const result = calculateStreak({
			currentStreak: 5,
			lastPlayedDate: "2026-03-01",
			longestStreak: 10,
		});

		expect(result.currentStreak).toBe(5);
		expect(result.longestStreak).toBe(10);
	});

	it("increments streak for consecutive day", () => {
		vi.setSystemTime(new Date("2026-03-02T08:00:00Z"));
		const result = calculateStreak({
			currentStreak: 3,
			lastPlayedDate: "2026-03-01",
			longestStreak: 5,
		});

		expect(result.currentStreak).toBe(4);
		expect(result.lastPlayedDate).toBe("2026-03-02");
		expect(result.longestStreak).toBe(5);
	});

	it("updates longest streak when exceeded", () => {
		vi.setSystemTime(new Date("2026-03-02T08:00:00Z"));
		const result = calculateStreak({
			currentStreak: 5,
			lastPlayedDate: "2026-03-01",
			longestStreak: 5,
		});

		expect(result.currentStreak).toBe(6);
		expect(result.longestStreak).toBe(6);
	});

	it("resets streak after a gap of 2+ days", () => {
		vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
		const result = calculateStreak({
			currentStreak: 10,
			lastPlayedDate: "2026-03-01",
			longestStreak: 15,
		});

		expect(result.currentStreak).toBe(1);
		expect(result.longestStreak).toBe(15);
	});

	it("resets streak when no previous date exists", () => {
		vi.setSystemTime(new Date("2026-03-01T12:00:00Z"));
		const result = calculateStreak({
			currentStreak: 0,
			lastPlayedDate: "",
			longestStreak: 0,
		});

		expect(result.currentStreak).toBe(1);
		expect(result.longestStreak).toBe(1);
	});

	it("handles month boundary correctly", () => {
		vi.setSystemTime(new Date("2026-04-01T10:00:00Z"));
		const result = calculateStreak({
			currentStreak: 7,
			lastPlayedDate: "2026-03-31",
			longestStreak: 7,
		});

		expect(result.currentStreak).toBe(8);
		expect(result.longestStreak).toBe(8);
	});

	it("handles year boundary correctly", () => {
		vi.setSystemTime(new Date("2027-01-01T10:00:00Z"));
		const result = calculateStreak({
			currentStreak: 3,
			lastPlayedDate: "2026-12-31",
			longestStreak: 10,
		});

		expect(result.currentStreak).toBe(4);
		expect(result.longestStreak).toBe(10);
	});
});
