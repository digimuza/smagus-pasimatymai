import { expect, test } from "@playwright/test";

test("premium mode guides a guest to sign in", async ({ page }) => {
	await page.goto("/en/audience");
	await page.waitForLoadState("networkidle");

	const acceptCookies = page.getByRole("button", { name: "Accept" });
	if (await acceptCookies.isVisible()) await acceptCookies.click();

	await page.getByRole("button", { name: /Family/i }).click();
	await expect(
		page.getByRole("button", { name: "Sign in to continue" }),
	).toBeVisible();
	await page.getByRole("button", { name: "Sign in to continue" }).click();
	await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
