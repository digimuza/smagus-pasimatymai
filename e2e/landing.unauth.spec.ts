import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
	test("loads and shows hero with CTA", async ({ page }) => {
		await page.goto("/en");

		await expect(page.getByText("Rediscover the one")).toBeVisible();

		const cta = page.getByRole("link", { name: /Start Playing/i });
		await expect(cta).toBeVisible();
	});

	test("CTA links to audience selection", async ({ page }) => {
		await page.goto("/en");

		const cta = page.getByRole("link", { name: /Start Playing/i });
		await cta.click();

		await expect(page).toHaveURL(/\/audience/);
	});

	test("shows FAQ section", async ({ page }) => {
		await page.goto("/en");

		await expect(page.getByText("Frequently asked questions")).toBeVisible();
	});
});
