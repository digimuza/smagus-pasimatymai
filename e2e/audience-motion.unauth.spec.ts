import { expect, test } from "@playwright/test";

for (const viewport of [
	{ height: 852, width: 393 },
	{ height: 1000, width: 1280 },
]) {
	test(`audience cards stay still during hover and delayed daily question (${viewport.width}px)`, async ({
		page,
	}) => {
		await page.setViewportSize(viewport);
		await page.route("**/api/players/me", (route) =>
			route.fulfill({ json: { user: null } }),
		);
		let release: () => void = () => {};
		const ready = new Promise<void>((resolve) => {
			release = resolve;
		});
		await page.route("**/api/daily-question?**", async (route) => {
			await ready;
			await route.fulfill({
				json: {
					date: "2026-10-08",
					id: 1,
					question: "A delayed daily question",
				},
			});
		});
		await page.goto("/en/audience");
		const card = page.getByRole("button", { name: /Couples Questions/i });
		await expect(card).toBeVisible();
		await expect(card).toHaveCSS("opacity", "1");
		await expect(card).toHaveCSS("transform", "none");
		const before = await card.boundingBox();
		await card.hover();
		await expect(card).toHaveCSS("transform", "none");
		release();
		await expect(page.getByText("A delayed daily question")).toBeAttached();
		expect(await card.boundingBox()).toEqual(before);
		await card.click();
		await expect(page).toHaveURL(/\/game/);
	});
}
