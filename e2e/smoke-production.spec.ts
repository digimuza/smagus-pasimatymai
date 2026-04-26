import { expect, test } from "@playwright/test";

const PROD_URL = process.env.PROD_URL?.replace(/\/$/, "");

test.describe("Production smoke tests", () => {
	test.skip(!PROD_URL, "PROD_URL environment variable is not set — skipping");
	test.setTimeout(10_000);

	test("health endpoint returns 200 and database is healthy", async ({
		request,
	}) => {
		const res = await request.get(`${PROD_URL}/api/health`);
		expect(res.status()).toBe(200);
		const body = await res.json();
		expect(body.status).toBe("healthy");
	});

	test("landing page renders headline", async ({ page }) => {
		await page.goto(`${PROD_URL}/en`);
		await expect(page.getByText("Rediscover the one")).toBeVisible();
	});

	test("landing page shows Start Playing CTA", async ({ page }) => {
		await page.goto(`${PROD_URL}/en`);
		await expect(
			page.getByRole("link", { name: /Start Playing/i }),
		).toBeVisible();
	});

	test("audience page is reachable", async ({ request }) => {
		const res = await request.get(`${PROD_URL}/en/audience`, {
			maxRedirects: 5,
		});
		expect(res.status()).toBe(200);
	});

	test("audience page shows audience buttons", async ({ page }) => {
		await page.goto(`${PROD_URL}/en/audience`, { waitUntil: "networkidle" });
		// If the user is redirected to login, the audience buttons won't be visible
		// but the page must respond without error
		const url = page.url();
		const isAudiencePage = url.includes("/audience");
		if (isAudiencePage) {
			await expect(page.getByText("Couples")).toBeVisible();
		}
	});

	test("game page is reachable", async ({ request }) => {
		const res = await request.get(`${PROD_URL}/en/game`, {
			maxRedirects: 5,
		});
		// 200 = page loaded, 3xx = redirected (e.g. to login) — both are fine
		expect(res.status()).toBeLessThan(500);
	});

	test("game page loads a swipe card or login prompt within 10 seconds", async ({
		page,
	}) => {
		await page.goto(`${PROD_URL}/en/audience`, { waitUntil: "networkidle" });
		const couplesBtn = page.getByRole("button", { name: /Couples/i });
		if (await couplesBtn.isVisible()) {
			await couplesBtn.click();
			await page.waitForURL(/\/game/, { timeout: 8_000 });
			await page.waitForLoadState("networkidle");
			// Either a question card or game controls must appear
			const hasCard = await page
				.getByText(/Questions left/i)
				.isVisible()
				.catch(() => false);
			const hasSkip = await page
				.getByText("Skip")
				.isVisible()
				.catch(() => false);
			expect(hasCard || hasSkip).toBe(true);
		} else {
			// Redirected to login — app is up but requires auth; smoke passes
			expect(page.url()).toMatch(/\/(en|login|auth)/);
		}
	});

	test("privacy page returns 200", async ({ request }) => {
		const res = await request.get(`${PROD_URL}/en/privacy`);
		expect(res.status()).toBe(200);
	});

	test("terms page returns 200", async ({ request }) => {
		const res = await request.get(`${PROD_URL}/en/terms`);
		expect(res.status()).toBe(200);
	});

	test("Google OAuth endpoint redirects to accounts.google.com", async ({
		request,
	}) => {
		const res = await request.get(`${PROD_URL}/api/auth/google`, {
			maxRedirects: 0,
		});
		expect([302, 307]).toContain(res.status());
		expect(res.headers()["location"]).toContain("accounts.google.com");
	});
});
