import { expect, test } from "@playwright/test";

const savedState = {
	activeCategories: ["Conversation"],
	audience: "romantic",
	currentQuestionId: null,
	questionStates: [],
	spicyCardsEnabled: false,
	spicyCardsRarity: "rare",
	spicyCardTypes: [],
};
const deck = {
	isContentLimited: false,
	sections: [
		{
			name: "Conversation",
			questions: [
				{ id: 1, question: "First test question?" },
				{ id: 2, question: "Second test question?" },
			],
			range: "2",
			type: "safe",
		},
	],
	spicyCards: [],
	title: "Test deck",
	total_questions: 2,
};

test.beforeEach(async ({ page }) => {
	await page.addInitScript((state) => {
		localStorage.setItem("santykiu_klausimai_state", JSON.stringify(state));
	}, savedState);
	await page.route("**/api/**", (route) =>
		route.fulfill({ json: { user: null } }),
	);
});

test("landing renders without JavaScript or database requests", async ({
	browser,
}) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto("/en");
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	await expect(
		page.getByRole("link", { name: /Start Playing/i }).first(),
	).toBeVisible();
	await context.close();
});

test("returning visitors see landing without loading their saved deck", async ({
	page,
}) => {
	const requests: string[] = [];
	page.on("request", (request) => {
		if (request.url().includes("/api/")) requests.push(request.url());
	});
	await page.goto("/en");
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	await page
		.getByRole("link", { name: /Start Playing/i })
		.first()
		.click();
	await expect(page).toHaveURL(/\/audience/);
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	expect(requests.filter((url) => url.includes("/game-data"))).toEqual([]);
});

test("failed game request offers retry and recovers", async ({ page }) => {
	let attempts = 0;
	await page.route("**/api/game-data?**", (route) => {
		attempts++;
		return route.fulfill(
			attempts === 1
				? { json: { error: "Unavailable" }, status: 500 }
				: { json: deck },
		);
	});
	await page.goto("/en/game");
	await expect(
		page.getByRole("alert").filter({ hasText: "could not be loaded" }),
	).toContainText("could not be loaded");
	await page.getByRole("button", { name: "Try again" }).click();
	await expect(page.getByText(/test question\?/)).toBeVisible();
});

test("hung request times out and allows changing audience", async ({
	page,
}) => {
	await page.route("**/api/game-data?**", () => {});
	await page.goto("/en/game");
	await expect(
		page.getByRole("alert").filter({ hasText: "could not be loaded" }),
	).toBeVisible({ timeout: 15000 });
	await page.getByRole("link", { name: "Choose an audience" }).click();
	await expect(page).toHaveURL(/\/audience/);
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("answering advances using updated progress and finishes the deck", async ({
	page,
}) => {
	await page.addInitScript(() => {
		Math.random = () => 0;
	});
	await page.route("**/api/game-data?**", (route) =>
		route.fulfill({ json: deck }),
	);
	await page.goto("/en/game");
	await expect(page.getByText("First test question?")).toBeVisible();
	await page.getByRole("button", { name: /Answered/i }).click();
	await expect(page.getByText("Second test question?")).toBeVisible();
	await page.getByRole("button", { name: /Answered/i }).click();
	await expect(page).toHaveURL(/\/awesome/);
});
