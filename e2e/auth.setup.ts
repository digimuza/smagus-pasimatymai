import { expect, test as setup } from "@playwright/test";

const TEST_PLAYER = {
	email: "e2e-test@example.com",
	name: "E2E Test Player",
	password: "TestPassword123!",
};

setup("authenticate", async ({ page, request, baseURL }) => {
	// 1. Create test player (idempotent — 201 if new, 400 if exists)
	await request.post("/api/players", {
		data: {
			email: TEST_PLAYER.email,
			name: TEST_PLAYER.name,
			password: TEST_PLAYER.password,
			provider: "email",
		},
	});

	// 2. Login to get auth cookie
	const loginRes = await request.post("/api/players/login", {
		data: {
			email: TEST_PLAYER.email,
			password: TEST_PLAYER.password,
		},
	});
	expect(loginRes.ok()).toBeTruthy();

	const loginData = await loginRes.json();

	// 3. Set cookie on browser context
	if (loginData.token) {
		const domain = new URL(baseURL || "http://localhost:7743").hostname;
		await page.context().addCookies([
			{
				domain,
				httpOnly: true,
				name: "payload-token",
				path: "/",
				sameSite: "Lax",
				secure: false,
				value: loginData.token,
			},
		]);
	}

	// 4. Verify auth works
	await page.goto("/en/audience");
	await page.waitForLoadState("networkidle");

	// 5. Save storage state
	await page.context().storageState({ path: "e2e/.auth/player.json" });
});
