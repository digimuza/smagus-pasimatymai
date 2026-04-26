import { describe, expect, it } from "vitest";
import { staggerDelay } from "../animations";

describe("staggerDelay", () => {
	it("returns delay of base for index 0 with defaults", () => {
		expect(staggerDelay(0)).toEqual({ delay: 0.3 });
	});

	it("increments delay by step for each index", () => {
		expect(staggerDelay(1)).toEqual({ delay: 0.4 });
		expect(staggerDelay(2)).toEqual({ delay: 0.5 });
	});

	it("accepts custom base and step values", () => {
		expect(staggerDelay(3, 0.1, 0.05)).toEqual({ delay: 0.25 });
	});

	it("returns base when step is zero", () => {
		expect(staggerDelay(10, 0.5, 0)).toEqual({ delay: 0.5 });
	});
});
