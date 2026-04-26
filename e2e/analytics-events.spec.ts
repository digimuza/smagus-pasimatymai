import { expect, type Page, test } from "@playwright/test";

const STORAGE_KEY = "santykiu_klausimai_state";
const CONSENT_KEY = "cookie_consent";

async function setupGame(page: Page) {
	await page.goto("/en");
	await page.evaluate(
		(keys: { state: string; consent: string }) => {
			localStorage.removeItem(keys.state);
			localStorage.setItem(keys.consent, "accepted");
		},
		{ consent: CONSENT_KEY, state: STORAGE_KEY },
	);
	await page.goto("/en/audience");
	await page.waitForLoadState("networkidle");
	await page.getByRole("button", { name: /Couples/i }).click();
	await page.waitForURL(/\/game/);
	await page.waitForLoadState("networkidle");
	await page
		.locator('[data-testid="swipe-card"]')
		.waitFor({ state: "visible", timeout: 8000 });
}

/** Simulate tab going background — triggers the visibilitychange flush path. */
async function flushAnalytics(page: Page) {
	await page.evaluate(() => {
		Object.defineProperty(document, "visibilityState", {
			configurable: true,
			get: () => "hidden",
		});
		document.dispatchEvent(new Event("visibilitychange"));
	});
}

async function dragCard(page: Page, direction: "left" | "right" | "up") {
	const card = page.locator('[data-testid="swipe-card"]');
	await card.waitFor({ state: "visible" });
	const box = await card.boundingBox();
	if (!box) throw new Error("SwipeCard bounding box not found");

	const cx = box.x + box.width / 2;
	const cy = box.y + box.height / 2;

	await page.mouse.move(cx, cy);
	await page.mouse.down();
	if (direction === "left") {
		await page.mouse.move(cx - 200, cy, { steps: 5 });
	} else if (direction === "right") {
		await page.mouse.move(cx + 200, cy, { steps: 5 });
	} else {
		await page.mouse.move(cx, cy - 200, { steps: 5 });
	}
	await page.mouse.up();
	await page.waitForTimeout(700);
}

type AnalyticsPayload = {
	events?: Array<{
		eventType?: string;
		questionId?: unknown;
		timestamp?: string;
	}>;
	session?: Record<string, unknown>;
};

/** Route-intercept all analytics calls, run the action, flush, then return payloads. */
async function captureAfterAction(
	page: Page,
	action: () => Promise<void>,
): Promise<AnalyticsPayload[]> {
	const payloads: AnalyticsPayload[] = [];
	await page.route("**/api/analytics", async (route) => {
		payloads.push(route.request().postDataJSON() as AnalyticsPayload);
		await route.continue();
	});

	await action();
	await flushAnalytics(page);
	await page
		.waitForRequest("**/api/analytics", { timeout: 3000 })
		.catch(() => {});

	await page.unroute("**/api/analytics");
	return payloads;
}

function allEvents(payloads: AnalyticsPayload[]) {
	return payloads.flatMap((p) => p?.events ?? []);
}

// ─── Event type coverage ───────────────────────────────────────────────────

test.describe("Analytics — event type coverage", () => {
	test.beforeEach(async ({ page }) => {
		await setupGame(page);
	});

	test("swipe-left fires a 'skipped' event with questionId and timestamp", async ({
		page,
	}) => {
		const payloads = await captureAfterAction(page, () =>
			dragCard(page, "left"),
		);

		const ev = allEvents(payloads).find((e) => e.eventType === "skipped");
		expect(ev, "skipped event missing from payload").toBeTruthy();
		expect(ev?.questionId).toBeTruthy();
		expect(ev?.timestamp).toBeTruthy();
	});

	test("swipe-right fires an 'answered' event with questionId and timestamp", async ({
		page,
	}) => {
		const payloads = await captureAfterAction(page, () =>
			dragCard(page, "right"),
		);

		const ev = allEvents(payloads).find((e) => e.eventType === "answered");
		expect(ev, "answered event missing from payload").toBeTruthy();
		expect(ev?.questionId).toBeTruthy();
		expect(ev?.timestamp).toBeTruthy();
	});

	test("swipe-up fires a 'superliked' event with questionId and timestamp", async ({
		page,
	}) => {
		const payloads = await captureAfterAction(page, () => dragCard(page, "up"));

		const ev = allEvents(payloads).find((e) => e.eventType === "superliked");
		expect(ev, "superliked event missing from payload").toBeTruthy();
		expect(ev?.questionId).toBeTruthy();
		expect(ev?.timestamp).toBeTruthy();
	});

	test("star-button tap fires a 'superliked' event with questionId and timestamp", async ({
		page,
	}) => {
		const payloads = await captureAfterAction(page, async () => {
			await page
				.locator('[data-testid="swipe-card"] button[aria-label*="SUPER"]')
				.click();
			await page.waitForTimeout(700);
		});

		const ev = allEvents(payloads).find((e) => e.eventType === "superliked");
		expect(ev, "superliked event missing from payload").toBeTruthy();
		expect(ev?.questionId).toBeTruthy();
		expect(ev?.timestamp).toBeTruthy();
	});

	test("'viewed' event is queued when the first card is shown", async ({
		page,
	}) => {
		// The viewed event is tracked during loadNextQuestion (already fired by beforeEach).
		// Flush what is sitting in the buffer without any additional swipe.
		const payloads: AnalyticsPayload[] = [];
		await page.route("**/api/analytics", async (route) => {
			payloads.push(route.request().postDataJSON() as AnalyticsPayload);
			await route.continue();
		});

		await flushAnalytics(page);
		await page
			.waitForRequest("**/api/analytics", { timeout: 3000 })
			.catch(() => {});

		const ev = allEvents(payloads).find((e) => e.eventType === "viewed");
		expect(ev, "viewed event missing from payload").toBeTruthy();
		expect(ev?.questionId).toBeTruthy();
		expect(ev?.timestamp).toBeTruthy();
	});
});

// ─── Payload shape ─────────────────────────────────────────────────────────

test.describe("Analytics — payload shape", () => {
	test.beforeEach(async ({ page }) => {
		await setupGame(page);
	});

	test("eventType skipped — questionId matches the active card", async ({
		page,
	}) => {
		const questionId = await page
			.locator('[data-testid="swipe-card"]')
			.getAttribute("data-question-id");
		expect(questionId).toBeTruthy();

		const payloads = await captureAfterAction(page, () =>
			dragCard(page, "left"),
		);
		const ev = allEvents(payloads).find((e) => e.eventType === "skipped");

		expect(String(ev?.questionId)).toBe(String(questionId));
	});

	test("eventType answered — questionId matches the active card", async ({
		page,
	}) => {
		const questionId = await page
			.locator('[data-testid="swipe-card"]')
			.getAttribute("data-question-id");
		expect(questionId).toBeTruthy();

		const payloads = await captureAfterAction(page, () =>
			dragCard(page, "right"),
		);
		const ev = allEvents(payloads).find((e) => e.eventType === "answered");

		expect(String(ev?.questionId)).toBe(String(questionId));
	});

	test("session data is present in the flush payload", async ({ page }) => {
		const payloads = await captureAfterAction(page, () =>
			dragCard(page, "right"),
		);

		const withSession = payloads.find((p) => p?.session != null);
		expect(withSession, "payload with session missing").toBeTruthy();

		const s = (withSession as AnalyticsPayload).session as Record<
			string,
			unknown
		>;
		expect(s.sessionId).toBeTruthy();
		expect(s.startedAt).toBeTruthy();
		expect(typeof s.questionsViewed).toBe("number");
		expect(typeof s.questionsSkipped).toBe("number");
	});

	test("multiple swipes accumulate into a single flush batch", async ({
		page,
	}) => {
		const payloads: AnalyticsPayload[] = [];
		await page.route("**/api/analytics", async (route) => {
			payloads.push(route.request().postDataJSON() as AnalyticsPayload);
			await route.continue();
		});

		// Two swipes before the flush
		await dragCard(page, "left");
		await page
			.locator('[data-testid="swipe-card"]')
			.waitFor({ state: "visible", timeout: 5000 });
		await dragCard(page, "right");
		await page
			.locator('[data-testid="swipe-card"]')
			.waitFor({ state: "visible", timeout: 5000 });

		await flushAnalytics(page);
		await page
			.waitForRequest("**/api/analytics", { timeout: 3000 })
			.catch(() => {});

		const events = allEvents(payloads);
		expect(
			events.filter((e) => e.eventType === "skipped").length,
		).toBeGreaterThanOrEqual(1);
		expect(
			events.filter((e) => e.eventType === "answered").length,
		).toBeGreaterThanOrEqual(1);
	});
});

// ─── Consent gate ──────────────────────────────────────────────────────────

test.describe("Analytics — consent gate", () => {
	test("no analytics request is sent when cookie consent is not given", async ({
		page,
	}) => {
		// Navigate without granting consent so the buffer never initialises
		await page.goto("/en");
		await page.evaluate(
			(keys: { state: string; consent: string }) => {
				localStorage.removeItem(keys.state);
				localStorage.removeItem(keys.consent);
			},
			{ consent: CONSENT_KEY, state: STORAGE_KEY },
		);
		await page.goto("/en/audience");
		await page.waitForLoadState("networkidle");
		await page.getByRole("button", { name: /Couples/i }).click();
		await page.waitForURL(/\/game/);
		await page.waitForLoadState("networkidle");
		await page
			.locator('[data-testid="swipe-card"]')
			.waitFor({ state: "visible", timeout: 8000 });

		const payloads: AnalyticsPayload[] = [];
		await page.route("**/api/analytics", async (route) => {
			payloads.push(route.request().postDataJSON() as AnalyticsPayload);
			await route.continue();
		});

		await dragCard(page, "right");
		// Dispatch visibilitychange — without consent the listener was never registered
		await flushAnalytics(page);
		await page.waitForTimeout(1000);

		expect(payloads.length).toBe(0);
	});

	test("no analytics request is sent when cookie consent is rejected", async ({
		page,
	}) => {
		await page.goto("/en");
		await page.evaluate(
			(keys: { state: string; consent: string }) => {
				localStorage.removeItem(keys.state);
				localStorage.setItem(keys.consent, "rejected");
			},
			{ consent: CONSENT_KEY, state: STORAGE_KEY },
		);
		await page.goto("/en/audience");
		await page.waitForLoadState("networkidle");
		await page.getByRole("button", { name: /Couples/i }).click();
		await page.waitForURL(/\/game/);
		await page.waitForLoadState("networkidle");
		await page
			.locator('[data-testid="swipe-card"]')
			.waitFor({ state: "visible", timeout: 8000 });

		const payloads: AnalyticsPayload[] = [];
		await page.route("**/api/analytics", async (route) => {
			payloads.push(route.request().postDataJSON() as AnalyticsPayload);
			await route.continue();
		});

		await dragCard(page, "right");
		await flushAnalytics(page);
		await page.waitForTimeout(1000);

		expect(payloads.length).toBe(0);
	});
});

// ─── Flush trigger ─────────────────────────────────────────────────────────

test.describe("Analytics — flush trigger", () => {
	test.beforeEach(async ({ page }) => {
		await setupGame(page);
	});

	test("events are sent on visibilitychange to 'hidden' before page unload", async ({
		page,
	}) => {
		// Register interceptor first so we catch the flush that fires immediately
		// when the tab goes hidden
		const requestPromise = page.waitForRequest("**/api/analytics", {
			timeout: 3000,
		});

		await page.route("**/api/analytics", async (route) => {
			await route.continue();
		});

		await dragCard(page, "right");
		await flushAnalytics(page);

		// If no analytics request was made this will throw, failing the test
		const req = await requestPromise;
		const body = req.postDataJSON() as AnalyticsPayload;
		expect(Array.isArray(body.events)).toBe(true);
	});
});
