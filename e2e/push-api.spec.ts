import { expect, test } from "@playwright/test";

const SUBSCRIPTION_PATH = "/api/push/subscription";
const SUBSCRIBE_PATH = "/api/push/subscribe";
const UNSUBSCRIBE_PATH = "/api/push/unsubscribe";

const makeTestEndpoint = () =>
	`https://push.example.com/e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const makeSubscription = (
	overrides: Partial<{
		auth: string;
		endpoint: string;
		frequency: "daily" | "weekly" | "off";
		locale: "en" | "lt";
		p256dh: string;
	}> = {},
) => ({
	auth: "dGVzdC1hdXRoLWtleQ",
	endpoint: makeTestEndpoint(),
	frequency: "daily" as const,
	locale: "en" as const,
	p256dh: "dGVzdC1wMjU2ZGgta2V5",
	...overrides,
});

test.describe("Push API — authenticated player", () => {
	test.beforeEach(async ({ request }) => {
		// Start each test with no subscriptions for the test player
		await request.delete(UNSUBSCRIBE_PATH);
	});

	test.describe("GET /api/push/subscription", () => {
		test("returns subscribed:false with null frequency when no subscription exists", async ({
			request,
		}) => {
			const response = await request.get(SUBSCRIPTION_PATH);
			expect(response.status()).toBe(200);
			const body = await response.json();
			expect(body).toEqual({ frequency: null, subscribed: false });
		});
	});

	test.describe("POST /api/push/subscribe — validation", () => {
		test("returns 400 when required fields are missing", async ({
			request,
		}) => {
			const response = await request.post(SUBSCRIBE_PATH, {
				data: { frequency: "daily" },
				headers: { "Content-Type": "application/json" },
			});
			expect(response.status()).toBe(400);
			const body = await response.json();
			expect(body).toHaveProperty("error");
		});

		test("returns 400 when endpoint is not a valid URL", async ({
			request,
		}) => {
			const response = await request.post(SUBSCRIBE_PATH, {
				data: makeSubscription({ endpoint: "not-a-valid-url" }),
				headers: { "Content-Type": "application/json" },
			});
			expect(response.status()).toBe(400);
			const body = await response.json();
			expect(body).toHaveProperty("error");
		});

		test("returns 400 when frequency is not daily, weekly, or off", async ({
			request,
		}) => {
			const response = await request.post(SUBSCRIBE_PATH, {
				data: makeSubscription({ frequency: "hourly" as never }),
				headers: { "Content-Type": "application/json" },
			});
			expect(response.status()).toBe(400);
			const body = await response.json();
			expect(body).toHaveProperty("error");
		});
	});

	test.describe("POST /api/push/subscribe — happy path", () => {
		test("creates subscription and GET reflects the new state", async ({
			request,
		}) => {
			const sub = makeSubscription({ frequency: "daily" });

			const postResponse = await request.post(SUBSCRIBE_PATH, {
				data: sub,
				headers: { "Content-Type": "application/json" },
			});
			expect(postResponse.status()).toBe(200);
			expect(await postResponse.json()).toEqual({ ok: true });

			const getResponse = await request.get(SUBSCRIPTION_PATH);
			expect(getResponse.status()).toBe(200);
			const getBody = await getResponse.json();
			expect(getBody.subscribed).toBe(true);
			expect(getBody.frequency).toBe("daily");
		});

		test("upserts frequency when same endpoint is re-submitted", async ({
			request,
		}) => {
			const sub = makeSubscription({ frequency: "daily" });

			// Initial subscribe
			await request.post(SUBSCRIBE_PATH, {
				data: sub,
				headers: { "Content-Type": "application/json" },
			});

			// Re-submit same endpoint with a different frequency
			const upsertResponse = await request.post(SUBSCRIBE_PATH, {
				data: { ...sub, frequency: "weekly" },
				headers: { "Content-Type": "application/json" },
			});
			expect(upsertResponse.status()).toBe(200);
			expect(await upsertResponse.json()).toEqual({ ok: true });

			// GET must reflect the updated frequency
			const getResponse = await request.get(SUBSCRIPTION_PATH);
			const getBody = await getResponse.json();
			expect(getBody.subscribed).toBe(true);
			expect(getBody.frequency).toBe("weekly");
		});
	});

	test.describe("DELETE /api/push/unsubscribe", () => {
		test("removes all subscriptions and returns { ok: true }", async ({
			request,
		}) => {
			// Create a subscription first
			await request.post(SUBSCRIBE_PATH, {
				data: makeSubscription(),
				headers: { "Content-Type": "application/json" },
			});

			const deleteResponse = await request.delete(UNSUBSCRIBE_PATH);
			expect(deleteResponse.status()).toBe(200);
			expect(await deleteResponse.json()).toEqual({ ok: true });

			// Subscription should be gone
			const getResponse = await request.get(SUBSCRIPTION_PATH);
			expect(await getResponse.json()).toEqual({
				frequency: null,
				subscribed: false,
			});
		});

		test("succeeds even when no subscription exists (idempotent)", async ({
			request,
		}) => {
			// beforeEach already cleaned up; call again to confirm idempotency
			const response = await request.delete(UNSUBSCRIBE_PATH);
			expect(response.status()).toBe(200);
			expect(await response.json()).toEqual({ ok: true });
		});
	});

	test("full lifecycle: subscribe → read → upsert → unsubscribe → read", async ({
		request,
	}) => {
		const sub = makeSubscription({ frequency: "daily", locale: "lt" });

		// 1. No subscription initially
		let res = await request.get(SUBSCRIPTION_PATH);
		expect(await res.json()).toEqual({ frequency: null, subscribed: false });

		// 2. Subscribe daily
		res = await request.post(SUBSCRIBE_PATH, {
			data: sub,
			headers: { "Content-Type": "application/json" },
		});
		expect(res.status()).toBe(200);

		// 3. GET shows subscribed:true, daily
		res = await request.get(SUBSCRIPTION_PATH);
		let body = await res.json();
		expect(body.subscribed).toBe(true);
		expect(body.frequency).toBe("daily");

		// 4. Upsert same endpoint to weekly
		res = await request.post(SUBSCRIBE_PATH, {
			data: { ...sub, frequency: "weekly" },
			headers: { "Content-Type": "application/json" },
		});
		expect(res.status()).toBe(200);

		// 5. GET reflects weekly
		res = await request.get(SUBSCRIPTION_PATH);
		body = await res.json();
		expect(body.subscribed).toBe(true);
		expect(body.frequency).toBe("weekly");

		// 6. Unsubscribe
		res = await request.delete(UNSUBSCRIBE_PATH);
		expect(res.status()).toBe(200);
		expect(await res.json()).toEqual({ ok: true });

		// 7. GET shows no subscription
		res = await request.get(SUBSCRIPTION_PATH);
		expect(await res.json()).toEqual({ frequency: null, subscribed: false });
	});
});
