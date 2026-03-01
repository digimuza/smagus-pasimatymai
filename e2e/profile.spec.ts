import { expect, test } from "@playwright/test";

test.describe("Profile page", () => {
	test("shows player info", async ({ page }) => {
		await page.goto("/en/profile");
		await page.waitForLoadState("networkidle");

		await expect(page.getByText("e2e-test@example.com")).toBeVisible();
	});

	test("shows stats grid", async ({ page }) => {
		await page.goto("/en/profile");
		await page.waitForLoadState("networkidle");

		await expect(page.getByText("Answered")).toBeVisible();
		await expect(page.getByText("Super")).toBeVisible();
		await expect(page.getByText("Total")).toBeVisible();
	});

	test("has sign out button", async ({ page }) => {
		await page.goto("/en/profile");
		await page.waitForLoadState("networkidle");

		await expect(page.getByRole("button", { name: /Sign out/i })).toBeVisible();
	});

	test("has danger zone with delete account", async ({ page }) => {
		await page.goto("/en/profile");
		await page.waitForLoadState("networkidle");

		await expect(page.getByText("Danger zone")).toBeVisible();
		await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
	});
});
