import { expect, test } from "@playwright/test";

test.describe("Game flow", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/en/audience");
		await page.waitForLoadState("networkidle");
		await page.getByRole("button", { name: /Couples/i }).click();
		await page.waitForURL(/\/game/);
	});

	test("displays question card", async ({ page }) => {
		await page.waitForLoadState("networkidle");

		// The localized deck must contain a playable question.
		await expect(
			page.locator("main").getByText("Questions left: 30"),
		).toBeVisible();
		await expect(page.locator("main .cursor-grab p")).toBeVisible();
	});

	test("shows game controls", async ({ page }) => {
		await page.waitForLoadState("networkidle");

		await expect(page.getByRole("button", { name: /Skip/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Super/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Answered/i })).toBeVisible();
		await page.getByRole("button", { name: /Answered/i }).click();
		await expect(page.getByText("Questions left: 29")).toBeVisible();
	});

	test("menu button opens sidebar", async ({ page }) => {
		await page.waitForLoadState("networkidle");

		await page.getByLabel("Open menu").click();

		await expect(
			page.getByRole("dialog").getByRole("heading", { name: "Categories" }),
		).toBeVisible();
		await expect(
			page.getByRole("dialog").getByRole("button", { name: /Change mode/i }),
		).toBeVisible();
	});
});
