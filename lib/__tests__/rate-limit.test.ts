import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../redis", () => ({ getRedis: vi.fn().mockReturnValue(null) }));

import { rateLimit } from "../rateLimit";

let keyCounter = 0;
function uniqueKey(label: string) {
	return `test-${label}-${++keyCounter}`;
}

describe("rateLimit (in-memory fallback)", () => {
	describe("basic behaviour", () => {
		it("allows the first request", async () => {
			const result = await rateLimit(uniqueKey("first"), {
				maxRequests: 3,
				windowMs: 60_000,
			});
			expect(result.success).toBe(true);
		});

		it("returns correct remaining count after first request", async () => {
			const result = await rateLimit(uniqueKey("remaining"), {
				maxRequests: 5,
				windowMs: 60_000,
			});
			expect(result.remaining).toBe(4);
		});

		it("decrements remaining on each successful request", async () => {
			const key = uniqueKey("decrement");
			const config = { maxRequests: 3, windowMs: 60_000 };

			expect((await rateLimit(key, config)).remaining).toBe(2);
			expect((await rateLimit(key, config)).remaining).toBe(1);
			expect((await rateLimit(key, config)).remaining).toBe(0);
		});

		it("denies the request once maxRequests is exceeded", async () => {
			const key = uniqueKey("exceed");
			const config = { maxRequests: 2, windowMs: 60_000 };

			await rateLimit(key, config);
			await rateLimit(key, config);
			const result = await rateLimit(key, config);

			expect(result.success).toBe(false);
			expect(result.remaining).toBe(0);
		});

		it("keeps denying requests until the window resets", async () => {
			const key = uniqueKey("keep-deny");
			const config = { maxRequests: 1, windowMs: 60_000 };

			await rateLimit(key, config); // uses up the limit
			expect((await rateLimit(key, config)).success).toBe(false);
			expect((await rateLimit(key, config)).success).toBe(false);
		});
	});

	describe("key isolation", () => {
		it("treats different keys as independent buckets", async () => {
			const keyA = uniqueKey("iso-a");
			const keyB = uniqueKey("iso-b");
			const config = { maxRequests: 1, windowMs: 60_000 };

			await rateLimit(keyA, config); // exhaust keyA

			expect((await rateLimit(keyB, config)).success).toBe(true);
		});
	});

	describe("window reset", () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("resets the bucket after windowMs elapses", async () => {
			const key = uniqueKey("reset");
			const config = { maxRequests: 2, windowMs: 1_000 };

			await rateLimit(key, config);
			await rateLimit(key, config);
			expect((await rateLimit(key, config)).success).toBe(false);

			vi.advanceTimersByTime(1_001);

			expect((await rateLimit(key, config)).success).toBe(true);
		});

		it("starts a fresh window with full capacity after reset", async () => {
			const key = uniqueKey("fresh-window");
			const config = { maxRequests: 3, windowMs: 500 };

			await rateLimit(key, config);
			await rateLimit(key, config);
			await rateLimit(key, config); // exhausted

			vi.advanceTimersByTime(501);

			const result = await rateLimit(key, config);
			expect(result.success).toBe(true);
			expect(result.remaining).toBe(2);
		});
	});
});
