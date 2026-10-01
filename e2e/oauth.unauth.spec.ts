import { expect, test } from "@playwright/test";

test.describe("Google OAuth", () => {
	test("redirects to Google accounts", async ({ request }) => {
		const response = await request.get("/api/auth/google", {
			maxRedirects: 0,
		});

		if (!process.env.GOOGLE_CLIENT_ID) {
			expect(response.status()).toBe(503);
			return;
		}

		// Next.js redirect (307) to Google OAuth
		expect([302, 307]).toContain(response.status());
		const { location } = response.headers();
		expect(location).toContain("accounts.google.com");
	});

	test("callback without code returns error", async ({ request }) => {
		const response = await request.get(
			"/api/auth/google/callback?error=access_denied",
			{ maxRedirects: 0 },
		);

		const { location } = response.headers();
		expect(location).toContain("auth=error");
	});
});
