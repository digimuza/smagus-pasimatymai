import { expect, test as setup } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "e2e-admin@example.com";

setup("authenticate as admin", async ({ page, request, baseURL }) => {
	// Create admin player (idempotent — 201 if new, 400 if exists)
	await request.post("/api/players", {
		data: {
			email: ADMIN_EMAIL,
			name: "E2E Admin Player",
			password: "AdminPassword123!",
			provider: "email",
		},
	});

	const loginRes = await request.post("/api/players/login", {
		data: {
			email: ADMIN_EMAIL,
			password: "AdminPassword123!",
		},
	});
	expect(loginRes.ok()).toBeTruthy();

	const loginData = await loginRes.json();

	if (loginData.token) {
		const domain = new URL(baseURL || "http://localhost:7743").hostname;
		await page.context().addCookies([
			{
				domain,
				httpOnly: true,
				name: "auth-token",
				path: "/",
				sameSite: "Lax",
				secure: false,
				value: loginData.token,
			},
		]);
	}

	await page.goto("/en/audience");
	await page.waitForLoadState("networkidle");

	await page.context().storageState({ path: "e2e/.auth/admin.json" });
});
