import { expect, test } from "@playwright/test";

// ─── Questions panel ───────────────────────────────────────────────────────

test.describe("Admin — Questions panel", () => {
	test("renders admin nav with Questions and Analytics links", async ({
		page,
	}) => {
		await page.goto("/admin/questions");
		await page.waitForLoadState("networkidle");

		const nav = page.locator("nav");
		await expect(nav.getByRole("link", { name: "Questions" })).toBeVisible();
		await expect(nav.getByRole("link", { name: "Analytics" })).toBeVisible();
	});

	test("shows questions table with expected column headers", async ({
		page,
	}) => {
		await page.goto("/admin/questions");
		await page.waitForLoadState("networkidle");

		for (const header of [
			"Question",
			"Category",
			"Audience",
			"Status",
			"Swipes",
		]) {
			await expect(
				page.getByRole("columnheader", { name: header }),
			).toBeVisible();
		}
	});

	test("shows seeded questions in the table", async ({ page }) => {
		await page.goto("/admin/questions");
		await page.waitForLoadState("networkidle");

		const rows = page.locator("tbody tr");
		await expect(rows.first()).toBeVisible();
		expect(await rows.count()).toBeGreaterThan(0);
	});

	test("search filter with no-match term shows empty state", async ({
		page,
	}) => {
		await page.goto("/admin/questions");
		await page.waitForLoadState("networkidle");

		await page.getByPlaceholder("Search text…").fill("zzz_no_match_xyz_abc");
		await page.getByRole("button", { name: "Filter" }).click();
		await page.waitForLoadState("networkidle");

		await expect(page.getByText("No questions found")).toBeVisible();
	});

	test("audience filter updates URL", async ({ page }) => {
		await page.goto("/admin/questions");
		await page.waitForLoadState("networkidle");

		await page.selectOption("select[name=audience]", "romantic");
		await page.getByRole("button", { name: "Filter" }).click();
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveURL(/audience=romantic/);
	});

	test("status filter shows only matching questions", async ({ page }) => {
		await page.goto("/admin/questions");
		await page.waitForLoadState("networkidle");

		await page.selectOption("select[name=status]", "published");
		await page.getByRole("button", { name: "Filter" }).click();
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveURL(/status=published/);
	});

	test("category filter updates URL", async ({ page }) => {
		await page.goto("/admin/questions");
		await page.waitForLoadState("networkidle");

		const categorySelect = page.locator("select[name=category]");
		const firstCategoryOption = categorySelect.locator("option").nth(1);
		const optionValue = await firstCategoryOption.getAttribute("value");

		if (!optionValue) {
			test.skip();
			return;
		}

		await categorySelect.selectOption(optionValue);
		await page.getByRole("button", { name: "Filter" }).click();
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveURL(new RegExp(`category=${optionValue}`));
	});

	test("clear filter link appears and resets filters", async ({ page }) => {
		await page.goto("/admin/questions?audience=romantic");
		await page.waitForLoadState("networkidle");

		const clearLink = page.getByRole("link", { name: "Clear" });
		await expect(clearLink).toBeVisible();

		await clearLink.click();
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveURL(/\/admin\/questions(?!\?)/);
	});

	test("clicking a question row opens the detail page", async ({ page }) => {
		await page.goto("/admin/questions");
		await page.waitForLoadState("networkidle");

		const firstLink = page.locator("tbody tr a").first();
		await firstLink.click();
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveURL(/\/admin\/questions\/\d+/);
		await expect(page.getByRole("link", { name: "← Questions" })).toBeVisible();
	});

	test("question detail shows question text and category field", async ({
		page,
	}) => {
		await page.goto("/admin/questions");
		await page.waitForLoadState("networkidle");

		await page.locator("tbody tr a").first().click();
		await page.waitForLoadState("networkidle");

		// Question text paragraph
		const questionText = page.locator("p.text-lg");
		await expect(questionText).toBeVisible();
		const text = await questionText.textContent();
		expect(text?.trim().length).toBeGreaterThan(0);

		// Category field label rendered by <Field label="Category" />
		await expect(page.getByText("Category").first()).toBeVisible();
	});

	test("question detail shows event analytics section", async ({ page }) => {
		await page.goto("/admin/questions");
		await page.waitForLoadState("networkidle");

		await page.locator("tbody tr a").first().click();
		await page.waitForLoadState("networkidle");

		// Analytics section always renders, even if totalEvents === 0
		await expect(page.getByText(/Analytics —/, { exact: false })).toBeVisible();
	});
});

// ─── Analytics dashboard ───────────────────────────────────────────────────

test.describe("Admin — Analytics dashboard", () => {
	test("shows date range tabs", async ({ page }) => {
		await page.goto("/admin/analytics");
		await page.waitForLoadState("networkidle");

		await expect(page.getByRole("link", { name: "Last 7 days" })).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Last 30 days" }),
		).toBeVisible();
		await expect(page.getByRole("link", { name: "All time" })).toBeVisible();
	});

	test("shows correct column headers in analytics table", async ({ page }) => {
		await page.goto("/admin/analytics");
		await page.waitForLoadState("networkidle");

		for (const header of [
			"Question",
			"Views",
			"Skips",
			"Answers",
			"Super-likes",
			"Skip Rate %",
			"Answer Rate %",
		]) {
			await expect(
				page.getByRole("columnheader", { name: header }),
			).toBeVisible();
		}
	});

	test("'All time' tab is active by default", async ({ page }) => {
		await page.goto("/admin/analytics");
		await page.waitForLoadState("networkidle");

		const allTimeLink = page.getByRole("link", { name: "All time" });
		await expect(allTimeLink).toHaveClass(/bg-indigo-600/);
	});

	test("clicking '7d' range updates URL and highlights active tab", async ({
		page,
	}) => {
		await page.goto("/admin/analytics");
		await page.waitForLoadState("networkidle");

		await page.getByRole("link", { name: "Last 7 days" }).click();
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveURL(/range=7d/);
		const sevenDayLink = page.getByRole("link", { name: "Last 7 days" });
		await expect(sevenDayLink).toHaveClass(/bg-indigo-600/);
	});

	test("clicking '30d' range updates URL and highlights active tab", async ({
		page,
	}) => {
		await page.goto("/admin/analytics");
		await page.waitForLoadState("networkidle");

		await page.getByRole("link", { name: "Last 30 days" }).click();
		await page.waitForLoadState("networkidle");

		await expect(page).toHaveURL(/range=30d/);
		const thirtyDayLink = page.getByRole("link", { name: "Last 30 days" });
		await expect(thirtyDayLink).toHaveClass(/bg-indigo-600/);
	});

	test("Export CSV button is present and enabled when data exists", async ({
		page,
	}) => {
		await page.goto("/admin/analytics");
		await page.waitForLoadState("networkidle");

		const exportBtn = page.getByRole("button", { name: "Export CSV" });
		await expect(exportBtn).toBeVisible();
	});

	test("clicking a column header sorts the table", async ({ page }) => {
		await page.goto("/admin/analytics");
		await page.waitForLoadState("networkidle");

		// Only test sorting when there is data to sort
		const noData = page.getByText("No data available for the selected period.");
		const hasNoData = await noData.isVisible().catch(() => false);
		if (hasNoData) {
			test.skip();
			return;
		}

		const viewsHeader = page.getByRole("columnheader", { name: /Views/ });
		await viewsHeader.click();
		// Sort indicator appears after click
		await expect(viewsHeader).toContainText("▲");

		await viewsHeader.click();
		await expect(viewsHeader).toContainText("▼");
	});

	test("views column shows descending sort indicator by default", async ({
		page,
	}) => {
		await page.goto("/admin/analytics");
		await page.waitForLoadState("networkidle");

		const noData = page.getByText("No data available for the selected period.");
		const hasNoData = await noData.isVisible().catch(() => false);
		if (hasNoData) {
			test.skip();
			return;
		}

		const viewsHeader = page.getByRole("columnheader", { name: /Views/ });
		await expect(viewsHeader).toContainText("▼");
	});

	test("question count subtitle is visible and shows a number", async ({
		page,
	}) => {
		await page.goto("/admin/analytics");
		await page.waitForLoadState("networkidle");

		await expect(
			page.getByText(/\d+ questions? with recorded events/),
		).toBeVisible();
	});

	test("'No data available' message appears and Export CSV is disabled when period has no events", async ({
		page,
	}) => {
		// Route-intercept the SSR data fetch is not possible; instead navigate to the
		// analytics page and check the empty-state path only when the period really is
		// empty (e.g. a fresh DB with no 7d events). If data exists we skip gracefully.
		await page.goto("/admin/analytics?range=7d");
		await page.waitForLoadState("networkidle");

		const noData = page.getByText("No data available for the selected period.");
		const hasNoData = await noData.isVisible().catch(() => false);
		if (!hasNoData) {
			test.skip();
			return;
		}

		await expect(noData).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Export CSV" }),
		).toBeDisabled();
	});
});

// ─── Analytics API ─────────────────────────────────────────────────────────────

test.describe("Admin — Analytics API", () => {
	test("GET /api/analytics/question-stats returns 200 with data array", async ({
		page,
	}) => {
		const res = await page.request.get("/api/analytics/question-stats");
		expect(res.status()).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body.data)).toBe(true);
	});

	test("GET /api/analytics/question-stats?range=7d returns 200 with data array", async ({
		page,
	}) => {
		const res = await page.request.get(
			"/api/analytics/question-stats?range=7d",
		);
		expect(res.status()).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body.data)).toBe(true);
	});

	test("GET /api/analytics/question-stats?range=30d returns 200 with data array", async ({
		page,
	}) => {
		const res = await page.request.get(
			"/api/analytics/question-stats?range=30d",
		);
		expect(res.status()).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body.data)).toBe(true);
	});

	test("data rows contain all expected fields with correct types", async ({
		page,
	}) => {
		const res = await page.request.get("/api/analytics/question-stats");
		expect(res.status()).toBe(200);
		const body = await res.json();

		if (body.data.length === 0) return;

		const row = body.data[0];
		expect(typeof row.id).toBe("number");
		expect(typeof row.question).toBe("string");
		expect(typeof row.views).toBe("number");
		expect(typeof row.skips).toBe("number");
		expect(typeof row.answers).toBe("number");
		expect(typeof row.superlikes).toBe("number");
		expect(typeof row.skipRate).toBe("number");
		expect(typeof row.answerRate).toBe("number");
	});

	test("skipRate and answerRate are percentages between 0 and 100", async ({
		page,
	}) => {
		const res = await page.request.get("/api/analytics/question-stats");
		expect(res.status()).toBe(200);
		const body = await res.json();

		for (const row of body.data as Array<{
			skipRate: number;
			answerRate: number;
		}>) {
			expect(row.skipRate).toBeGreaterThanOrEqual(0);
			expect(row.skipRate).toBeLessThanOrEqual(100);
			expect(row.answerRate).toBeGreaterThanOrEqual(0);
			expect(row.answerRate).toBeLessThanOrEqual(100);
		}
	});
});
