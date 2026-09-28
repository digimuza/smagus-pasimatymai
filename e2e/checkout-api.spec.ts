import { expect, test } from "@playwright/test";

test.describe("Checkout API", () => {
	test("rejects invalid plan", async ({ request }) => {
		const response = await request.post("/api/checkout", {
			data: { plan: "invalid" },
			headers: { "Content-Type": "application/json" },
		});

		expect(response.status()).toBe(400);
	});

	test("rejects request without auth", async () => {
		const response = await fetch(
			`${process.env.PLAYWRIGHT_BASE_URL || "http://localhost:7743"}/api/checkout`,
			{
				body: JSON.stringify({ plan: "monthly" }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			},
		);
		expect(response.status).toBe(401);
	});
});
