import { expect, test } from "@playwright/test";

test.describe("Admin — access control", () => {
	test("unauthenticated user is redirected from /admin/questions", async ({
		page,
	}) => {
		await page.goto("/admin/questions");
		await page.waitForLoadState("networkidle");

		await expect(page).not.toHaveURL(/admin/);
	});

	test("unauthenticated user is redirected from /admin/analytics", async ({
		page,
	}) => {
		await page.goto("/admin/analytics");
		await page.waitForLoadState("networkidle");

		await expect(page).not.toHaveURL(/admin/);
	});

	test("unauthenticated user is redirected from /admin/questions detail", async ({
		page,
	}) => {
		await page.goto("/admin/questions/1");
		await page.waitForLoadState("networkidle");

		await expect(page).not.toHaveURL(/admin/);
	});
});

// ─── Analytics API — access control ───────────────────────────────────────────

test.describe("Analytics API — access control", () => {
	test("GET /api/analytics/question-stats returns 401 without auth", async ({
		request,
	}) => {
		const res = await request.get("/api/analytics/question-stats");
		expect(res.status()).toBe(401);
	});

	test("GET /api/analytics/question-stats?range=7d returns 401 without auth", async ({
		request,
	}) => {
		const res = await request.get("/api/analytics/question-stats?range=7d");
		expect(res.status()).toBe(401);
	});

	test("GET /api/analytics/question-stats?range=30d returns 401 without auth", async ({
		request,
	}) => {
		const res = await request.get("/api/analytics/question-stats?range=30d");
		expect(res.status()).toBe(401);
	});
});
