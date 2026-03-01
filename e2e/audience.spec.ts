import { expect, test } from "@playwright/test";

test.describe("Audience selection", () => {
	test("shows all four audiences", async ({ page }) => {
		await page.goto("/en/audience");
		await page.waitForLoadState("networkidle");

		await expect(page.getByText("Couples")).toBeVisible();
		await expect(page.getByText("Family")).toBeVisible();
		await expect(page.getByText("Friends")).toBeVisible();
		await expect(page.getByText("Kids")).toBeVisible();
	});

	test("selecting Couples navigates to game", async ({ page }) => {
		await page.goto("/en/audience");
		await page.waitForLoadState("networkidle");

		await page.getByRole("button", { name: /Couples/i }).click();

		await expect(page).toHaveURL(/\/game/);
	});

	test("selecting premium audience shows paywall for free user", async ({
		page,
	}) => {
		await page.goto("/en/audience");
		await page.waitForLoadState("networkidle");

		await page.getByRole("button", { name: /Family/i }).click();

		// Paywall should appear with premium title
		await expect(page.getByText("Unlock all questions")).toBeVisible();
	});
});
