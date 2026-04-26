import { expect, type Page, test } from "@playwright/test";

const STORAGE_KEY = "santykiu_klausimai_state";
const SESSION_KEY = "santykiu_session_id";

interface QuestionStateEntry {
	answeredAt?: string;
	id: number;
	status: string;
}

interface LocalState {
	activeCategories: string[];
	audience: string | null;
	currentQuestionId: number | null;
	questionStates: QuestionStateEntry[];
}

async function goToGame(page: Page) {
	await page.goto("/en/audience");
	await page.waitForLoadState("networkidle");
	await page.getByRole("button", { name: /Couples/i }).click();
	await page.waitForURL(/\/game/);
	await page.waitForLoadState("networkidle");
	await page
		.locator('[data-testid="swipe-card"]')
		.waitFor({ state: "visible", timeout: 8000 });
}

async function getLocalState(page: Page): Promise<LocalState | null> {
	return page.evaluate((key: string) => {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : null;
	}, STORAGE_KEY);
}

/** Drag the top card left or right by 200px. */
async function dragCard(page: Page, direction: "left" | "right") {
	const card = page.locator('[data-testid="swipe-card"]');
	await card.waitFor({ state: "visible" });
	const box = await card.boundingBox();
	if (!box) throw new Error("SwipeCard bounding box not found");

	const cx = box.x + box.width / 2;
	const cy = box.y + box.height / 2;

	await page.mouse.move(cx, cy);
	await page.mouse.down();
	await page.mouse.move(direction === "left" ? cx - 200 : cx + 200, cy, {
		steps: 5,
	});
	await page.mouse.up();
	// Exit animation runs for 300ms; add headroom for React state propagation
	await page.waitForTimeout(700);
}

/**
 * Click the star tap-button on the active card — the programmatic alternative
 * to an upward drag for superliking.
 */
async function tapSuperlike(page: Page) {
	await page
		.locator('[data-testid="swipe-card"] button[aria-label*="SUPER"]')
		.click();
	await page.waitForTimeout(700);
}

// ─── Swipe gesture tests ───────────────────────────────────────────────────

test.describe("Swipe card gestures", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/en");
		await page.evaluate(
			(key: string) => localStorage.removeItem(key),
			STORAGE_KEY,
		);
		await goToGame(page);
	});

	test("swipe left skips question and shows a new card", async ({ page }) => {
		const firstText = (
			await page.locator('[data-testid="swipe-card"]').textContent()
		)?.trim();
		expect(firstText).toBeTruthy();

		await dragCard(page, "left");

		await page
			.locator('[data-testid="swipe-card"]')
			.waitFor({ state: "visible", timeout: 5000 });
		const nextText = (
			await page.locator('[data-testid="swipe-card"]').textContent()
		)?.trim();

		expect(nextText).toBeTruthy();
		expect(nextText).not.toBe(firstText);
	});

	test("swipe right answers question and shows a new card", async ({
		page,
	}) => {
		const firstText = (
			await page.locator('[data-testid="swipe-card"]').textContent()
		)?.trim();

		await dragCard(page, "right");

		await page
			.locator('[data-testid="swipe-card"]')
			.waitFor({ state: "visible", timeout: 5000 });
		const nextText = (
			await page.locator('[data-testid="swipe-card"]').textContent()
		)?.trim();

		expect(nextText).toBeTruthy();
		expect(nextText).not.toBe(firstText);

		const state = await getLocalState(page);
		const answeredCount =
			state?.questionStates?.filter((q) => q.status === "answered").length ?? 0;
		expect(answeredCount).toBe(1);
	});

	test("star button superlikes question and shows a new card", async ({
		page,
	}) => {
		const firstText = (
			await page.locator('[data-testid="swipe-card"]').textContent()
		)?.trim();

		await tapSuperlike(page);

		await page
			.locator('[data-testid="swipe-card"]')
			.waitFor({ state: "visible", timeout: 5000 });
		const nextText = (
			await page.locator('[data-testid="swipe-card"]').textContent()
		)?.trim();

		expect(nextText).toBeTruthy();
		expect(nextText).not.toBe(firstText);

		const state = await getLocalState(page);
		const superlikedCount =
			state?.questionStates?.filter((q) => q.status === "superliked").length ??
			0;
		expect(superlikedCount).toBe(1);
	});

	test("swipe up gesture also superlikes question", async ({ page }) => {
		const card = page.locator('[data-testid="swipe-card"]');
		await card.waitFor({ state: "visible" });
		const box = await card.boundingBox();
		if (!box) throw new Error("SwipeCard bounding box not found");

		const cx = box.x + box.width / 2;
		const cy = box.y + box.height / 2;

		await page.mouse.move(cx, cy);
		await page.mouse.down();
		await page.mouse.move(cx, cy - 200, { steps: 5 });
		await page.mouse.up();
		await page.waitForTimeout(700);

		const state = await getLocalState(page);
		const superlikedCount =
			state?.questionStates?.filter((q) => q.status === "superliked").length ??
			0;
		expect(superlikedCount).toBe(1);
	});

	test("answered questions reduce the available question count", async ({
		page,
	}) => {
		const countText = await page
			.locator('[data-testid="question-count"]')
			.textContent();
		// "Questions left: N" — extract the trailing integer
		const initialCount = parseInt(
			(countText ?? "").match(/\d+/)?.[0] ?? "0",
			10,
		);
		expect(initialCount).toBeGreaterThan(0);

		await dragCard(page, "right");
		await page
			.locator('[data-testid="swipe-card"]')
			.waitFor({ state: "visible", timeout: 5000 });

		const updatedText = await page
			.locator('[data-testid="question-count"]')
			.textContent();
		const updatedCount = parseInt(
			(updatedText ?? "").match(/\d+/)?.[0] ?? "0",
			10,
		);

		expect(updatedCount).toBe(initialCount - 1);
	});

	test("skipped question does NOT reduce available count (skips can reappear)", async ({
		page,
	}) => {
		const countText = await page
			.locator('[data-testid="question-count"]')
			.textContent();
		const initialCount = parseInt(
			(countText ?? "").match(/\d+/)?.[0] ?? "0",
			10,
		);

		await dragCard(page, "left");
		await page
			.locator('[data-testid="swipe-card"]')
			.waitFor({ state: "visible", timeout: 5000 });

		const updatedText = await page
			.locator('[data-testid="question-count"]')
			.textContent();
		const updatedCount = parseInt(
			(updatedText ?? "").match(/\d+/)?.[0] ?? "0",
			10,
		);

		// Skipped questions stay in the pool
		expect(updatedCount).toBe(initialCount);
	});
});

// ─── Session tracking tests ────────────────────────────────────────────────

test.describe("Session tracking", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/en");
		await page.evaluate(
			(key: string) => localStorage.removeItem(key),
			STORAGE_KEY,
		);
		await goToGame(page);
	});

	test("session ID is created in sessionStorage when game starts", async ({
		page,
	}) => {
		const sessionId = await page.evaluate(
			(key: string) => sessionStorage.getItem(key),
			SESSION_KEY,
		);
		expect(sessionId).toBeTruthy();
		// Must be a valid v4 UUID
		expect(sessionId).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
		);
	});

	test("session ID persists across page reloads within the same tab", async ({
		page,
	}) => {
		const idBefore = await page.evaluate(
			(key: string) => sessionStorage.getItem(key),
			SESSION_KEY,
		);
		expect(idBefore).toBeTruthy();

		await page.reload();
		await page.waitForLoadState("networkidle");

		// sessionStorage survives tab reload (not a new tab)
		const idAfter = await page.evaluate(
			(key: string) => sessionStorage.getItem(key),
			SESSION_KEY,
		);
		expect(idAfter).toBe(idBefore);
	});

	test("answered question is persisted to localStorage and excluded from available pool", async ({
		page,
	}) => {
		const questionId = await page
			.locator('[data-testid="swipe-card"]')
			.getAttribute("data-question-id");
		expect(questionId).toBeTruthy();

		await dragCard(page, "right");

		const state = await getLocalState(page);
		const entry = state?.questionStates?.find(
			(q) => q.id === parseInt(questionId ?? "0", 10),
		);
		expect(entry?.status).toBe("answered");

		// After reload the answered state must survive (localStorage is persistent)
		await page.reload();
		await page.waitForLoadState("networkidle");
		const stateAfterReload = await getLocalState(page);
		const entryAfterReload = stateAfterReload?.questionStates?.find(
			(q) => q.id === parseInt(questionId ?? "0", 10),
		);
		expect(entryAfterReload?.status).toBe("answered");
	});

	test("superliked question appears in favorites list on /awesome page", async ({
		page,
	}) => {
		// Grab just the question text paragraph (avoid picking up badge/label text)
		const questionText = (
			await page.locator('[data-testid="swipe-card"] p').first().textContent()
		)?.trim();
		expect(questionText).toBeTruthy();

		await tapSuperlike(page);

		await page.goto("/en/awesome");
		await page.waitForLoadState("networkidle");

		await expect(
			page.getByText(questionText ?? "", { exact: false }),
		).toBeVisible();
	});

	test("superliked question does not reappear as the active swipe card", async ({
		page,
	}) => {
		const firstCardId = await page
			.locator('[data-testid="swipe-card"]')
			.getAttribute("data-question-id");

		await tapSuperlike(page);

		await page
			.locator('[data-testid="swipe-card"]')
			.waitFor({ state: "visible", timeout: 5000 });

		const nextCardId = await page
			.locator('[data-testid="swipe-card"]')
			.getAttribute("data-question-id");

		// Next card must be a different question
		expect(nextCardId).not.toBe(firstCardId);

		// And the superliked ID must be in localStorage as excluded
		const state = await getLocalState(page);
		const superliked = state?.questionStates?.find(
			(q) => q.id === parseInt(firstCardId ?? "0", 10),
		);
		expect(superliked?.status).toBe("superliked");
	});

	test("analytics events are sent on swipe right", async ({ page }) => {
		const analyticsPayloads: unknown[] = [];

		await page.route("**/api/analytics", async (route) => {
			analyticsPayloads.push(route.request().postDataJSON());
			await route.continue();
		});

		await dragCard(page, "right");

		// Trigger the analytics buffer flush via visibility-change event
		await page.evaluate(() => {
			Object.defineProperty(document, "visibilityState", {
				configurable: true,
				get: () => "hidden",
			});
			document.dispatchEvent(new Event("visibilitychange"));
		});

		await page
			.waitForRequest("**/api/analytics", { timeout: 3000 })
			.catch(() => {});

		const hasAnsweredEvent = analyticsPayloads.some((payload) => {
			const p = payload as { events?: Array<{ eventType?: string }> };
			return p?.events?.some((e) => e.eventType === "answered");
		});
		expect(hasAnsweredEvent).toBe(true);
	});
});

// ─── Category filtering tests ──────────────────────────────────────────────

test.describe("Category filtering", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/en");
		await page.evaluate(
			(key: string) => localStorage.removeItem(key),
			STORAGE_KEY,
		);
		await goToGame(page);
	});

	test("disabling a category reduces the available question count", async ({
		page,
	}) => {
		const stateBefore = await getLocalState(page);
		expect(stateBefore?.activeCategories?.length).toBeGreaterThan(1);

		const countBefore = parseInt(
			(
				(await page.locator('[data-testid="question-count"]').textContent()) ??
				""
			).match(/\d+/)?.[0] ?? "0",
			10,
		);
		expect(countBefore).toBeGreaterThan(0);

		// Navigate to categories and toggle the first non-disabled category off
		await page.goto("/en/categories");
		await page.waitForLoadState("networkidle");

		// Category buttons contain the name + question count; they are not
		// the "Start the game" CTA. Pick the first one that is not disabled.
		await page
			.locator("button:not([disabled])")
			.filter({ hasNotText: /Start the game/i })
			.first()
			.click();

		await page.getByRole("button", { name: /Start the game/i }).click();
		await page.waitForURL(/\/game/);
		await page.waitForLoadState("networkidle");
		await page
			.locator('[data-testid="swipe-card"]')
			.waitFor({ state: "visible", timeout: 5000 });

		const countAfter = parseInt(
			(
				(await page.locator('[data-testid="question-count"]').textContent()) ??
				""
			).match(/\d+/)?.[0] ?? "0",
			10,
		);

		expect(countAfter).toBeLessThan(countBefore);
	});

	test("last active category cannot be deselected", async ({ page }) => {
		await page.goto("/en/categories");
		await page.waitForLoadState("networkidle");

		// Deactivate categories one at a time until only one remains
		for (let i = 0; i < 10; i++) {
			const state = await getLocalState(page);
			if ((state?.activeCategories?.length ?? 2) <= 1) break;

			const nextEnabled = page
				.locator("button:not([disabled])")
				.filter({ hasNotText: /Start the game/i })
				.first();
			const count = await nextEnabled.count();
			if (count === 0) break;
			await nextEnabled.click();
			await page.waitForTimeout(200);
		}

		const stateWithOne = await getLocalState(page);
		const remainingCount = stateWithOne?.activeCategories?.length ?? 0;
		expect(remainingCount).toBeGreaterThanOrEqual(1);

		// Clicking the sole enabled category button should have no effect
		const activeEnabled = page
			.locator("button:not([disabled])")
			.filter({ hasNotText: /Start the game/i });
		const activeCount = await activeEnabled.count();

		// The last active category button should now be disabled
		expect(activeCount).toBe(0);
	});

	test("active category selection persists in localStorage after reload", async ({
		page,
	}) => {
		await page.goto("/en/categories");
		await page.waitForLoadState("networkidle");

		const stateBefore = await getLocalState(page);
		// Toggle off one category if possible
		if ((stateBefore?.activeCategories?.length ?? 0) > 1) {
			await page
				.locator("button:not([disabled])")
				.filter({ hasNotText: /Start the game/i })
				.first()
				.click();
			await page.waitForTimeout(300);
		}

		const stateAfterToggle = await getLocalState(page);
		expect(Array.isArray(stateAfterToggle?.activeCategories)).toBe(true);

		await page.reload();
		await page.waitForLoadState("networkidle");

		const stateAfterReload = await getLocalState(page);
		expect(stateAfterReload?.activeCategories).toEqual(
			stateAfterToggle?.activeCategories,
		);
	});

	test("category counter in sidebar reflects active category count", async ({
		page,
	}) => {
		const state = await getLocalState(page);
		const expectedCount = state?.activeCategories?.length ?? 0;

		await page.getByLabel(/open menu/i).click();
		await page.waitForTimeout(300);

		// Sidebar shows "N / M" active categories
		await expect(
			page.getByText(new RegExp(`${expectedCount}\\s*/`)),
		).toBeVisible();
	});
});
