import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "../rateLimit";

// Use a unique key prefix per test to avoid state bleed from the shared module-level Map.
let keyCounter = 0;
function uniqueKey(label: string) {
	return `test-${label}-${++keyCounter}`;
}

describe("rateLimit", () => {
	describe("basic behaviour", () => {
		it("allows the first request", () => {
			const result = rateLimit(uniqueKey("first"), {
				maxRequests: 3,
				windowMs: 60_000,
			});
			expect(result.success).toBe(true);
		});

		it("returns correct remaining count after first request", () => {
			const result = rateLimit(uniqueKey("remaining"), {
				maxRequests: 5,
				windowMs: 60_000,
			});
			expect(result.remaining).toBe(4);
		});

		it("decrements remaining on each successful request", () => {
			const key = uniqueKey("decrement");
			const config = { maxRequests: 3, windowMs: 60_000 };

			expect(rateLimit(key, config).remaining).toBe(2);
			expect(rateLimit(key, config).remaining).toBe(1);
			expect(rateLimit(key, config).remaining).toBe(0);
		});

		it("denies the request once maxRequests is exceeded", () => {
			const key = uniqueKey("exceed");
			const config = { maxRequests: 2, windowMs: 60_000 };

			rateLimit(key, config);
			rateLimit(key, config);
			const result = rateLimit(key, config);

			expect(result.success).toBe(false);
			expect(result.remaining).toBe(0);
		});

		it("keeps denying requests until the window resets", () => {
			const key = uniqueKey("keep-deny");
			const config = { maxRequests: 1, windowMs: 60_000 };

			rateLimit(key, config); // uses up the limit
			expect(rateLimit(key, config).success).toBe(false);
			expect(rateLimit(key, config).success).toBe(false);
		});
	});

	describe("key isolation", () => {
		it("treats different keys as independent buckets", () => {
			const keyA = uniqueKey("iso-a");
			const keyB = uniqueKey("iso-b");
			const config = { maxRequests: 1, windowMs: 60_000 };

			rateLimit(keyA, config); // exhaust keyA

			// keyB should still succeed
			expect(rateLimit(keyB, config).success).toBe(true);
		});
	});

	describe("window reset", () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("resets the bucket after windowMs elapses", () => {
			const key = uniqueKey("reset");
			const config = { maxRequests: 2, windowMs: 1_000 };

			rateLimit(key, config);
			rateLimit(key, config);
			expect(rateLimit(key, config).success).toBe(false);

			vi.advanceTimersByTime(1_001);

			expect(rateLimit(key, config).success).toBe(true);
		});

		it("starts a fresh window with full capacity after reset", () => {
			const key = uniqueKey("fresh-window");
			const config = { maxRequests: 3, windowMs: 500 };

			rateLimit(key, config);
			rateLimit(key, config);
			rateLimit(key, config); // exhausted

			vi.advanceTimersByTime(501);

			const result = rateLimit(key, config);
			expect(result.success).toBe(true);
			expect(result.remaining).toBe(2);
		});
	});
});
