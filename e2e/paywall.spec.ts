import { expect, test } from "@playwright/test";

test.describe("Paywall", () => {
	test("shows pricing plans when triggered", async ({ page }) => {
		await page.goto("/en/audience");
		await page.waitForLoadState("networkidle");

		// Click premium audience to trigger paywall
		await page.getByRole("button", { name: /Family/i }).click();

		// Paywall title
		await expect(page.getByText("Unlock all questions")).toBeVisible();

		// Plan options
		await expect(page.getByText("Monthly")).toBeVisible();
		await expect(page.getByText("Yearly")).toBeVisible();
	});

	test("shows feature list with checkmarks", async ({ page }) => {
		await page.goto("/en/audience");
		await page.waitForLoadState("networkidle");

		await page.getByRole("button", { name: /Family/i }).click();

		await expect(page.getByText("All questions without limits")).toBeVisible();
		await expect(page.getByText("Spicy Cards challenges")).toBeVisible();
	});

	test("shows trial CTA", async ({ page }) => {
		await page.goto("/en/audience");
		await page.waitForLoadState("networkidle");

		await page.getByRole("button", { name: /Family/i }).click();

		await expect(
			page.getByRole("button", { name: /Try 7 days free/i }),
		).toBeVisible();
		await expect(
			page.getByText("7-day free trial. Cancel anytime."),
		).toBeVisible();
	});
});
