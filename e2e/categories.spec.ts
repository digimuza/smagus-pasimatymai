import { expect, test } from "@playwright/test";

test.describe("Categories", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to game first (sets audience), then to categories
		await page.goto("/en/audience");
		await page.waitForLoadState("networkidle");
		await page.getByRole("button", { name: /Couples/i }).click();
		await page.waitForURL(/\/game/);
		await page.goto("/en/categories");
		await page.waitForLoadState("networkidle");
	});

	test("shows category list with counter", async ({ page }) => {
		await expect(page.getByText("Categories selected")).toBeVisible();
		await expect(page.getByText("Main categories")).toBeVisible();
	});

	test("start game button exists", async ({ page }) => {
		const startButton = page.getByRole("button", {
			name: /Start the game/i,
		});
		await expect(startButton).toBeVisible();
	});

	test("start game navigates to /game", async ({ page }) => {
		await page.getByRole("button", { name: /Start the game/i }).click();

		await expect(page).toHaveURL(/\/game/);
	});
});
