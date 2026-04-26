// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("ioredis", () => {
	class RedisMock {
		on = vi.fn();
	}
	return { default: RedisMock };
});

describe("getRedis", () => {
	afterEach(() => {
		vi.resetModules();
	});

	it("returns null when REDIS_URL is not set", async () => {
		const savedUrl = process.env.REDIS_URL;
		delete process.env.REDIS_URL;
		try {
			const { getRedis } = await import("../redis");
			expect(getRedis()).toBeNull();
		} finally {
			if (savedUrl !== undefined) process.env.REDIS_URL = savedUrl;
		}
	});

	it("returns a client when REDIS_URL is configured", async () => {
		process.env.REDIS_URL = "redis://localhost:6379";
		try {
			const { getRedis } = await import("../redis");
			expect(getRedis()).not.toBeNull();
		} finally {
			delete process.env.REDIS_URL;
		}
	});

	it("returns the same client instance on repeated calls", async () => {
		process.env.REDIS_URL = "redis://localhost:6379";
		try {
			const { getRedis } = await import("../redis");
			expect(getRedis()).toBe(getRedis());
		} finally {
			delete process.env.REDIS_URL;
		}
	});
});
