import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getVapidPublicKey, sendPushNotification } from "../push";
import { pushFrequencyUpdateSchema, pushSubscribeSchema } from "../schemas";

vi.mock("web-push", () => ({
	default: {
		sendNotification: vi.fn().mockResolvedValue({ statusCode: 201 }),
		setVapidDetails: vi.fn(),
	},
}));

vi.mock("@/drizzle/db", () => ({
	db: {
		delete: vi
			.fn()
			.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
		select: vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi
					.fn()
					.mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }),
			}),
		}),
	},
}));

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

// ---------------------------------------------------------------------------
// sendPushNotification
// ---------------------------------------------------------------------------
describe("sendPushNotification", () => {
	beforeEach(() => {
		process.env.VAPID_PUBLIC_KEY = "test-public-key";
		process.env.VAPID_PRIVATE_KEY = "test-private-key";
		process.env.VAPID_EMAIL = "admin@test.com";
	});

	afterEach(() => {
		delete process.env.VAPID_PUBLIC_KEY;
		delete process.env.VAPID_PRIVATE_KEY;
		delete process.env.VAPID_EMAIL;
		vi.clearAllMocks();
	});

	it("calls webPush.sendNotification with the subscription and serialised payload", async () => {
		const webPush = (await import("web-push")).default;

		const subscription = {
			auth: "auth-token",
			endpoint: "https://fcm.googleapis.com/send/example",
			p256dh: "p256dh-key",
		};
		const payload = {
			body: "Test body",
			title: "Test title",
			url: "https://example.com",
		};

		await sendPushNotification(subscription, payload);

		expect(webPush.sendNotification).toHaveBeenCalledWith(
			{
				endpoint: subscription.endpoint,
				keys: { auth: subscription.auth, p256dh: subscription.p256dh },
			},
			JSON.stringify(payload),
		);
	});

	it("throws when VAPID keys are not configured", async () => {
		delete process.env.VAPID_PUBLIC_KEY;
		await expect(
			sendPushNotification(
				{ auth: "a", endpoint: "https://example.com/send", p256dh: "p" },
				{ body: "b", title: "t", url: "https://example.com" },
			),
		).rejects.toThrow("VAPID keys are not configured");
	});
});
