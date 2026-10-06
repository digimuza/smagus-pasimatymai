import { expect, test } from "@playwright/test";

test.use({
	hasTouch: true,
	isMobile: true,
	viewport: { height: 844, width: 390 },
});

test("language changes directly, persists on reload, and keeps query parameters", async ({
	page,
}) => {
	await page.goto("/en?source=mobile");
	const requests: string[] = [];
	page.on("request", (request) =>
		requests.push(new URL(request.url()).pathname),
	);
	await page.getByRole("link", { exact: true, name: "Lietuvių" }).click();
	await expect(page.locator("html")).toHaveAttribute("lang", "lt");
	await expect(page).toHaveURL(/\/\?source=mobile$/);
	expect(requests).not.toContain("/lt");
	await page.reload();
	await expect(page.locator("html")).toHaveAttribute("lang", "lt");
	await page.getByRole("link", { exact: true, name: "English" }).click();
	await expect(page.locator("html")).toHaveAttribute("lang", "en");
	await expect(page).toHaveURL(/\/en\?source=mobile$/);
});

test("language tap gives feedback while navigation is delayed", async ({
	page,
}) => {
	await page.goto("/en");
	let release: () => void = () => {};
	const ready = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route(/\?_rsc=/, async (route) => {
		await ready;
		await route.continue();
	});
	await page.getByRole("link", { exact: true, name: "Lietuvių" }).click();
	await expect(
		page.getByRole("navigation", { name: "Language" }),
	).toHaveAttribute("aria-busy", "true");
	release();
	await expect(page.locator("html")).toHaveAttribute("lang", "lt");
});

test("mobile preview stays still and scroll does not reveal hidden sections", async ({
	page,
}) => {
	await page.clock.install();
	await page.goto("/en");
	const preview = page.locator(".preview-question");
	const question = await preview.innerText();
	await page.clock.fastForward(15000);
	await expect(preview).toHaveText(question);
	for (const heading of await page.locator("main h2").all()) {
		await heading.scrollIntoViewIfNeeded();
		await expect(heading).toBeVisible();
		await expect(heading).toHaveCSS("opacity", "1");
	}
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth,
		),
	).toBe(true);
	expect(
		await page.evaluate(
			() =>
				document
					.getAnimations()
					.filter((animation) => animation.playState === "running").length,
		),
	).toBe(0);
});

test("language links and FAQ work before JavaScript loads", async ({
	browser,
}) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { height: 844, width: 390 },
	});
	const page = await context.newPage();
	await page.goto("/en");
	await page.locator("summary").first().click();
	await expect(page.locator("details").first()).toHaveAttribute("open", "");
	await page.getByRole("link", { exact: true, name: "Lietuvių" }).click();
	await expect(page.locator("html")).toHaveAttribute("lang", "lt");
	await context.close();
});

test("touch swipe advances a game card without scrolling the page", async ({
	page,
	context,
}) => {
	await page.addInitScript(() => {
		Math.random = () => 0;
		localStorage.setItem(
			"santykiu_klausimai_state",
			JSON.stringify({
				activeCategories: [],
				audience: "romantic",
				currentQuestionId: null,
				questionStates: [],
				spicyCardsEnabled: false,
			}),
		);
	});
	await page.route("**/api/**", (route) =>
		route.fulfill({ json: { user: null } }),
	);
	await page.route("**/api/game-data?**", (route) =>
		route.fulfill({
			json: {
				isContentLimited: false,
				sections: [
					{
						name: "Test",
						questions: [
							{ id: 1, question: "Swipe this card" },
							{ id: 2, question: "Next card" },
						],
						range: "2",
						type: "safe",
					},
				],
				spicyCards: [],
				title: "Test",
				total_questions: 2,
			},
		}),
	);
	await page.goto("/en/game");
	const card = page.locator(".paper-card");
	await expect(card).toHaveCSS("touch-action", "none");
	const bounds = await card.boundingBox();
	if (!bounds) throw new Error("Missing card");
	const scrollBefore = await page.evaluate(() => scrollY);
	const cdp = await context.newCDPSession(page);
	const x = bounds.x + bounds.width / 2;
	const y = bounds.y + bounds.height / 2;
	await cdp.send("Input.dispatchTouchEvent", {
		touchPoints: [{ x, y }],
		type: "touchStart",
	});
	for (let distance = 20; distance <= 140; distance += 20) {
		await cdp.send("Input.dispatchTouchEvent", {
			touchPoints: [{ x: x + distance, y }],
			type: "touchMove",
		});
	}
	await cdp.send("Input.dispatchTouchEvent", {
		touchPoints: [],
		type: "touchEnd",
	});
	await expect(page.getByText("Next card", { exact: true })).toBeVisible();
	expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
});
