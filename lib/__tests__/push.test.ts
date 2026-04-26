import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getVapidPublicKey } from "../push";
import { pushFrequencyUpdateSchema, pushSubscribeSchema } from "../schemas";

// ---------------------------------------------------------------------------
// pushSubscribeSchema
// ---------------------------------------------------------------------------
describe("pushSubscribeSchema", () => {
	it("accepts a valid subscription body", () => {
		const result = pushSubscribeSchema.safeParse({
			auth: "someAuthToken",
			endpoint: "https://fcm.googleapis.com/fcm/send/example",
			frequency: "daily",
			p256dh: "someP256dhKey",
		});
		expect(result.success).toBe(true);
	});

	it("accepts optional locale", () => {
		const result = pushSubscribeSchema.safeParse({
			auth: "token",
			endpoint: "https://fcm.googleapis.com/fcm/send/example",
			frequency: "weekly",
			locale: "en",
			p256dh: "key",
		});
		expect(result.success).toBe(true);
	});

	it("rejects invalid frequency", () => {
		const result = pushSubscribeSchema.safeParse({
			auth: "token",
			endpoint: "https://example.com",
			frequency: "hourly",
			p256dh: "key",
		});
		expect(result.success).toBe(false);
	});

	it("rejects non-URL endpoint", () => {
		const result = pushSubscribeSchema.safeParse({
			auth: "token",
			endpoint: "not-a-url",
			frequency: "daily",
			p256dh: "key",
		});
		expect(result.success).toBe(false);
	});

	it("rejects missing required fields", () => {
		const result = pushSubscribeSchema.safeParse({ frequency: "daily" });
		expect(result.success).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// pushFrequencyUpdateSchema
// ---------------------------------------------------------------------------
describe("pushFrequencyUpdateSchema", () => {
	it("accepts daily", () => {
		expect(
			pushFrequencyUpdateSchema.safeParse({ frequency: "daily" }).success,
		).toBe(true);
	});

	it("accepts weekly", () => {
		expect(
			pushFrequencyUpdateSchema.safeParse({ frequency: "weekly" }).success,
		).toBe(true);
	});

	it("accepts off", () => {
		expect(
			pushFrequencyUpdateSchema.safeParse({ frequency: "off" }).success,
		).toBe(true);
	});

	it("rejects unknown frequency", () => {
		expect(
			pushFrequencyUpdateSchema.safeParse({ frequency: "monthly" }).success,
		).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// getVapidPublicKey
// ---------------------------------------------------------------------------
describe("getVapidPublicKey", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("returns the VAPID_PUBLIC_KEY env var when set", () => {
		process.env.VAPID_PUBLIC_KEY = "test-public-key";
		expect(getVapidPublicKey()).toBe("test-public-key");
	});

	it("throws when VAPID_PUBLIC_KEY is not set", () => {
		delete process.env.VAPID_PUBLIC_KEY;
		expect(() => getVapidPublicKey()).toThrow("VAPID_PUBLIC_KEY is not set");
	});
});
