import { expect, test } from "@playwright/test";

test.describe("Checkout API", () => {
	test("rejects invalid plan", async ({ request }) => {
		const response = await request.post("/api/checkout", {
			data: { plan: "invalid" },
			headers: { "Content-Type": "application/json" },
		});

		expect(response.status()).toBe(400);
	});

	test("rejects request without auth", async ({ page }) => {
		// Create a fresh context without auth cookies
		const browser = page.context().browser();
		if (!browser) throw new Error("No browser instance");
		const freshContext = await browser.newContext();

		const response = await freshContext.request.post(
			`${process.env.PLAYWRIGHT_BASE_URL || "http://localhost:7743"}/api/checkout`,
			{
				data: { plan: "monthly" },
				headers: { "Content-Type": "application/json" },
			},
		);

		expect(response.status()).toBe(401);
		await freshContext.close();
	});
});
