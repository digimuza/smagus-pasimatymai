import { describe, expect, it } from "vitest";
import { classifySwipe } from "../gestureEngine";

const zero = { x: 0, y: 0 };
const _defaultDirs = ["left", "right", "up"] as const;

describe("classifySwipe", () => {
	it("returns null when offset and velocity are both zero", () => {
		expect(classifySwipe(zero, zero)).toBeNull();
	});

	it("returns null when gesture is below threshold in all directions", () => {
		expect(classifySwipe({ x: 30, y: 30 }, { x: 100, y: 100 })).toBeNull();
	});

	// --- Left ---

	it("returns 'left' when x offset exceeds threshold negatively", () => {
		expect(classifySwipe({ x: -61, y: 0 }, zero)).toBe("left");
	});

	it("returns 'left' exactly at negative threshold boundary", () => {
		expect(classifySwipe({ x: -60, y: 0 }, zero)).toBeNull(); // < not <=
		expect(classifySwipe({ x: -61, y: 0 }, zero)).toBe("left");
	});

	it("returns 'left' when x velocity exceeds velocity threshold negatively", () => {
		expect(classifySwipe(zero, { x: -501, y: 0 })).toBe("left");
	});

	it("returns null for left when x velocity is exactly at velocity threshold", () => {
		expect(classifySwipe(zero, { x: -500, y: 0 })).toBeNull();
	});

	// --- Right ---

	it("returns 'right' when x offset exceeds threshold positively", () => {
		expect(classifySwipe({ x: 61, y: 0 }, zero)).toBe("right");
	});

	it("returns 'right' when x velocity exceeds velocity threshold positively", () => {
		expect(classifySwipe(zero, { x: 501, y: 0 })).toBe("right");
	});

	// --- Up ---

	it("returns 'up' when y offset exceeds threshold negatively (up enabled)", () => {
		expect(classifySwipe({ x: 0, y: -61 }, zero)).toBe("up");
	});

	it("returns 'up' when y velocity exceeds velocity threshold negatively", () => {
		expect(classifySwipe(zero, { x: 0, y: -501 })).toBe("up");
	});

	// --- Down ---

	it("returns 'down' when y offset exceeds threshold positively (down enabled)", () => {
		expect(classifySwipe({ x: 0, y: 61 }, zero, 60, 500, ["down"])).toBe(
			"down",
		);
	});

	it("returns null for down when down is not in enabledDirections", () => {
		expect(classifySwipe({ x: 0, y: 61 }, zero)).toBeNull();
	});

	// --- Priority ---

	it("up takes priority over left when both thresholds are met", () => {
		expect(classifySwipe({ x: -61, y: -61 }, zero)).toBe("up");
	});

	it("up takes priority over right when both thresholds are met", () => {
		expect(classifySwipe({ x: 61, y: -61 }, zero)).toBe("up");
	});

	// --- Enabled directions ---

	it("returns null when enabledDirections is empty", () => {
		expect(
			classifySwipe({ x: 100, y: 100 }, { x: 600, y: 600 }, 60, 500, []),
		).toBeNull();
	});

	it("ignores a direction that is not in enabledDirections", () => {
		expect(
			classifySwipe({ x: -100, y: 0 }, zero, 60, 500, ["right", "up"]),
		).toBeNull();
	});

	it("respects only the directions that are enabled", () => {
		expect(classifySwipe({ x: 100, y: 0 }, zero, 60, 500, ["right"])).toBe(
			"right",
		);
	});

	// --- Custom thresholds ---

	it("uses a custom offset threshold", () => {
		expect(classifySwipe({ x: -30, y: 0 }, zero, 20, 500)).toBe("left");
	});

	it("uses a custom velocity threshold", () => {
		expect(classifySwipe(zero, { x: -200, y: 0 }, 60, 100)).toBe("left");
	});

	it("returns null when custom threshold is higher than gesture", () => {
		expect(classifySwipe({ x: -50, y: 0 }, zero, 100, 500)).toBeNull();
	});
});
