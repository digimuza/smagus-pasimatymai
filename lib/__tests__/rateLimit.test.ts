import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "../rateLimit";

describe("rateLimit", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("allows the first request and returns maxRequests-1 remaining", () => {
		const result = rateLimit("rl-t1", { maxRequests: 5, windowMs: 1000 });
		expect(result.success).toBe(true);
		expect(result.remaining).toBe(4);
	});

	it("decrements remaining on each successive request", () => {
		const config = { maxRequests: 3, windowMs: 1000 };
		rateLimit("rl-t2", config);
		const second = rateLimit("rl-t2", config);
		expect(second.success).toBe(true);
		expect(second.remaining).toBe(1);
		const third = rateLimit("rl-t2", config);
		expect(third.success).toBe(true);
		expect(third.remaining).toBe(0);
	});

	it("blocks requests once the limit is reached", () => {
		const config = { maxRequests: 2, windowMs: 1000 };
		rateLimit("rl-t3", config);
		rateLimit("rl-t3", config);
		const result = rateLimit("rl-t3", config);
		expect(result.success).toBe(false);
		expect(result.remaining).toBe(0);
	});

	it("resets the window after windowMs elapses", () => {
		const config = { maxRequests: 1, windowMs: 1000 };
		rateLimit("rl-t4", config);
		const blocked = rateLimit("rl-t4", config);
		expect(blocked.success).toBe(false);

		vi.advanceTimersByTime(1001);
		const allowed = rateLimit("rl-t4", config);
		expect(allowed.success).toBe(true);
		expect(allowed.remaining).toBe(0);
	});

	it("tracks different keys independently", () => {
		const config = { maxRequests: 1, windowMs: 1000 };
		rateLimit("rl-t5a", config);
		rateLimit("rl-t5a", config); // limit exceeded

		const result = rateLimit("rl-t5b", config);
		expect(result.success).toBe(true);
	});

	it("returns remaining 0 when exactly at the limit", () => {
		const config = { maxRequests: 3, windowMs: 1000 };
		rateLimit("rl-t6", config);
		rateLimit("rl-t6", config);
		const third = rateLimit("rl-t6", config);
		expect(third.success).toBe(true);
		expect(third.remaining).toBe(0);
	});
});
