import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../redis", () => ({ getRedis: vi.fn().mockReturnValue(null) }));

import { rateLimit } from "../rateLimit";

describe("rateLimit (in-memory fallback)", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("allows the first request and returns maxRequests-1 remaining", async () => {
		const result = await rateLimit("rl-t1", { maxRequests: 5, windowMs: 1000 });
		expect(result.success).toBe(true);
		expect(result.remaining).toBe(4);
	});

	it("decrements remaining on each successive request", async () => {
		const config = { maxRequests: 3, windowMs: 1000 };
		await rateLimit("rl-t2", config);
		const second = await rateLimit("rl-t2", config);
		expect(second.success).toBe(true);
		expect(second.remaining).toBe(1);
		const third = await rateLimit("rl-t2", config);
		expect(third.success).toBe(true);
		expect(third.remaining).toBe(0);
	});

	it("blocks requests once the limit is reached", async () => {
		const config = { maxRequests: 2, windowMs: 1000 };
		await rateLimit("rl-t3", config);
		await rateLimit("rl-t3", config);
		const result = await rateLimit("rl-t3", config);
		expect(result.success).toBe(false);
		expect(result.remaining).toBe(0);
	});

	it("resets the window after windowMs elapses", async () => {
		const config = { maxRequests: 1, windowMs: 1000 };
		await rateLimit("rl-t4", config);
		const blocked = await rateLimit("rl-t4", config);
		expect(blocked.success).toBe(false);

		vi.advanceTimersByTime(1001);
		const allowed = await rateLimit("rl-t4", config);
		expect(allowed.success).toBe(true);
		expect(allowed.remaining).toBe(0);
	});

	it("tracks different keys independently", async () => {
		const config = { maxRequests: 1, windowMs: 1000 };
		await rateLimit("rl-t5a", config);
		await rateLimit("rl-t5a", config); // limit exceeded

		const result = await rateLimit("rl-t5b", config);
		expect(result.success).toBe(true);
	});

	it("returns remaining 0 when exactly at the limit", async () => {
		const config = { maxRequests: 3, windowMs: 1000 };
		await rateLimit("rl-t6", config);
		await rateLimit("rl-t6", config);
		const third = await rateLimit("rl-t6", config);
		expect(third.success).toBe(true);
		expect(third.remaining).toBe(0);
	});
});
