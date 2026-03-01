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

		// Game should show a question or at minimum the control area
		await expect(page.getByText(/Questions left/i)).toBeVisible();
	});

	test("shows game controls", async ({ page }) => {
		await page.waitForLoadState("networkidle");

		await expect(page.getByText("Skip")).toBeVisible();
		await expect(page.getByText("Super")).toBeVisible();
		await expect(page.getByText("Answered")).toBeVisible();
	});

	test("menu button opens sidebar", async ({ page }) => {
		await page.waitForLoadState("networkidle");

		await page.getByLabel("Open menu").click();

		await expect(page.getByText("Categories")).toBeVisible();
		await expect(page.getByText("Change mode")).toBeVisible();
	});
});
