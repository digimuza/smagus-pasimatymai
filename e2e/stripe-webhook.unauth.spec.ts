import crypto from "node:crypto";
import { expect, test } from "@playwright/test";

const WEBHOOK_PATH = "/api/webhooks/stripe";

function signStripePayload(payload: string, secret: string): string {
	const timestamp = Math.floor(Date.now() / 1000);
	const hmac = crypto
		.createHmac("sha256", secret)
		.update(`${timestamp}.${payload}`)
		.digest("hex");
	return `t=${timestamp},v1=${hmac}`;
}

test.describe("Stripe Webhook", () => {
	test("rejects request with no stripe-signature header", async ({
		request,
	}) => {
		const response = await request.post(WEBHOOK_PATH, {
			data: JSON.stringify({ type: "checkout.session.completed" }),
			headers: { "Content-Type": "application/json" },
		});
		expect(response.status()).toBe(400);
		const body = await response.json();
		expect(body.error).toBe("Missing signature");
	});

	test("rejects request with invalid stripe-signature", async ({ request }) => {
		const response = await request.post(WEBHOOK_PATH, {
			data: JSON.stringify({ type: "checkout.session.completed" }),
			headers: {
				"Content-Type": "application/json",
				"stripe-signature": "t=12345,v1=invalidsignature",
			},
		});
		expect(response.status()).toBe(400);
		const body = await response.json();
		// When STRIPE_WEBHOOK_SECRET is configured the handler reaches signature
		// verification and returns "Invalid signature". When the secret is absent
		// the early-exit guard fires first and returns "Missing signature" instead.
		if (process.env.STRIPE_WEBHOOK_SECRET) {
			expect(body.error).toBe("Invalid signature");
		} else {
			expect(body.error).toBe("Missing signature");
		}
	});

	test("acknowledges unhandled event types", async ({ request }) => {
		const secret = process.env.STRIPE_WEBHOOK_SECRET;
		test.skip(!secret, "STRIPE_WEBHOOK_SECRET not set in test environment");

		const payload = JSON.stringify({
			data: { object: {} },
			id: `evt_test_unhandled_${Date.now()}`,
			type: "payment_intent.created",
		});
		const sig = signStripePayload(payload, secret as string);

		const response = await request.post(WEBHOOK_PATH, {
			data: payload,
			headers: {
				"Content-Type": "application/json",
				"stripe-signature": sig,
			},
		});
		expect(response.status()).toBe(200);
		const body = await response.json();
		expect(body.received).toBe(true);
		expect(body.duplicate).toBeUndefined();
	});

	test("processes handled event and returns received:true", async ({
		request,
	}) => {
		const secret = process.env.STRIPE_WEBHOOK_SECRET;
		test.skip(!secret, "STRIPE_WEBHOOK_SECRET not set in test environment");

		const payload = JSON.stringify({
			data: {
				object: {
					cancel_at_period_end: false,
					id: "sub_test_nonexistent_e2e",
					items: { data: [] },
					object: "subscription",
					status: "canceled",
				},
			},
			id: `evt_test_sub_del_${Date.now()}`,
			type: "customer.subscription.deleted",
		});
		const sig = signStripePayload(payload, secret as string);

		const response = await request.post(WEBHOOK_PATH, {
			data: payload,
			headers: {
				"Content-Type": "application/json",
				"stripe-signature": sig,
			},
		});
		expect(response.status()).toBe(200);
		const body = await response.json();
		expect(body.received).toBe(true);
		expect(body.duplicate).toBeUndefined();
	});

	test("returns duplicate flag on idempotent replay", async ({ request }) => {
		const secret = process.env.STRIPE_WEBHOOK_SECRET;
		test.skip(!secret, "STRIPE_WEBHOOK_SECRET not set in test environment");

		const eventId = `evt_test_idempotent_${Date.now()}`;
		const payload = JSON.stringify({
			data: {
				object: {
					cancel_at_period_end: false,
					id: "sub_test_idempotent_e2e",
					items: { data: [] },
					object: "subscription",
					status: "canceled",
				},
			},
			id: eventId,
			type: "customer.subscription.deleted",
		});

		const firstSig = signStripePayload(payload, secret as string);
		const first = await request.post(WEBHOOK_PATH, {
			data: payload,
			headers: {
				"Content-Type": "application/json",
				"stripe-signature": firstSig,
			},
		});
		expect(first.status()).toBe(200);
		expect((await first.json()).received).toBe(true);

		// Replay same event ID — handler must detect the duplicate
		const secondSig = signStripePayload(payload, secret as string);
		const second = await request.post(WEBHOOK_PATH, {
			data: payload,
			headers: {
				"Content-Type": "application/json",
				"stripe-signature": secondSig,
			},
		});
		expect(second.status()).toBe(200);
		const secondBody = await second.json();
		expect(secondBody.duplicate).toBe(true);
		expect(secondBody.received).toBe(true);
	});
});
