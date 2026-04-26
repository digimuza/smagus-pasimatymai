import { expect, test } from "@playwright/test";

const VAPID_KEY_PATH = "/api/push/vapid-public-key";
const SUBSCRIPTION_PATH = "/api/push/subscription";
const SUBSCRIBE_PATH = "/api/push/subscribe";
const UNSUBSCRIBE_PATH = "/api/push/unsubscribe";
const SEND_PATH = "/api/push/send";

test.describe("GET /api/push/vapid-public-key", () => {
	test("is public — returns publicKey string or 503 when not configured", async ({
		request,
	}) => {
		const response = await request.get(VAPID_KEY_PATH);
		if (response.status() === 200) {
			const body = await response.json();
			expect(typeof body.publicKey).toBe("string");
			expect(body.publicKey.length).toBeGreaterThan(0);
		} else {
			expect(response.status()).toBe(503);
			const body = await response.json();
			expect(body).toHaveProperty("error");
		}
	});
});

test.describe("GET /api/push/subscription — unauthenticated", () => {
	test("returns 401 without auth cookie", async ({ request }) => {
		const response = await request.get(SUBSCRIPTION_PATH);
		expect(response.status()).toBe(401);
	});
});

test.describe("POST /api/push/subscribe — unauthenticated", () => {
	test("returns 401 without auth cookie", async ({ request }) => {
		const response = await request.post(SUBSCRIBE_PATH, {
			data: {
				auth: "test-auth",
				endpoint: "https://push.example.com/test",
				frequency: "daily",
				p256dh: "test-p256dh",
			},
			headers: { "Content-Type": "application/json" },
		});
		expect(response.status()).toBe(401);
	});
});

test.describe("DELETE /api/push/unsubscribe — unauthenticated", () => {
	test("returns 401 without auth cookie", async ({ request }) => {
		const response = await request.delete(UNSUBSCRIBE_PATH);
		expect(response.status()).toBe(401);
	});
});

test.describe("POST /api/push/send — authorization guards", () => {
	test("returns 401 or 500 when called without Authorization header", async ({
		request,
	}) => {
		const response = await request.post(SEND_PATH, {
			data: { frequency: "daily" },
			headers: { "Content-Type": "application/json" },
		});
		// 500 when PUSH_CRON_SECRET env var is absent; 401 when it is present
		expect([401, 500]).toContain(response.status());
	});

	test("returns 401 or 500 when called with incorrect Bearer token", async ({
		request,
	}) => {
		const response = await request.post(SEND_PATH, {
			data: { frequency: "daily" },
			headers: {
				Authorization: "Bearer totally-wrong-secret",
				"Content-Type": "application/json",
			},
		});
		expect([401, 500]).toContain(response.status());
	});

	test("returns 400 for missing frequency field when authorized", async ({
		request,
	}) => {
		const cronSecret = process.env.PUSH_CRON_SECRET;
		test.skip(!cronSecret, "PUSH_CRON_SECRET not set in test environment");

		const response = await request.post(SEND_PATH, {
			data: {},
			headers: {
				Authorization: `Bearer ${cronSecret}`,
				"Content-Type": "application/json",
			},
		});
		expect(response.status()).toBe(400);
		const body = await response.json();
		expect(body).toHaveProperty("error");
	});

	test("returns 400 for invalid frequency value when authorized", async ({
		request,
	}) => {
		const cronSecret = process.env.PUSH_CRON_SECRET;
		test.skip(!cronSecret, "PUSH_CRON_SECRET not set in test environment");

		const response = await request.post(SEND_PATH, {
			data: { frequency: "hourly" },
			headers: {
				Authorization: `Bearer ${cronSecret}`,
				"Content-Type": "application/json",
			},
		});
		expect(response.status()).toBe(400);
		const body = await response.json();
		expect(body).toHaveProperty("error");
	});
});
