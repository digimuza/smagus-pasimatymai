import { expect, test } from "@playwright/test";

test.describe("Settings page", () => {
	test.beforeEach(async ({ page }) => {
		// Must go through game first so audience context is set
		await page.goto("/en/audience");
		await page.waitForLoadState("networkidle");
		await page.getByRole("button", { name: /Couples/i }).click();
		await page.waitForURL(/\/game/);
		await page.goto("/en/settings");
		await page.waitForLoadState("networkidle");
	});

	test("shows spicy cards toggle", async ({ page }) => {
		await expect(page.getByText("🎲 Spicy Cards")).toBeVisible();
	});

	test("back to game button works", async ({ page }) => {
		await page.getByRole("button", { name: /Back to game/i }).click();

		await expect(page).toHaveURL(/\/game/);
	});
});
