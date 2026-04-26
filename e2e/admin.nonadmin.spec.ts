import { expect, test } from "@playwright/test";

// Runs under the "non-admin" project which injects a regular (non-admin)
// player's auth-token cookie. The admin guard must reject these users even
// though their JWT is valid, because their email is not in ADMIN_EMAILS.

test.describe("Admin — non-admin authenticated user redirect", () => {
	test("is redirected from /admin/questions", async ({ page }) => {
		await page.goto("/admin/questions");
		await page.waitForLoadState("networkidle");

		await expect(page).not.toHaveURL(/admin/);
	});

	test("is redirected from /admin/analytics", async ({ page }) => {
		await page.goto("/admin/analytics");
		await page.waitForLoadState("networkidle");

		await expect(page).not.toHaveURL(/admin/);
	});

	test("is redirected from admin question detail", async ({ page }) => {
		await page.goto("/admin/questions/1");
		await page.waitForLoadState("networkidle");

		await expect(page).not.toHaveURL(/admin/);
	});
});
