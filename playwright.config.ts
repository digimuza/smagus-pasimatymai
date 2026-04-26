import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	forbidOnly: !!process.env.CI,
	fullyParallel: true,
	projects: [
		{ name: "setup", testMatch: /auth\.setup\.ts$/ },
		{ name: "admin-setup", testMatch: /admin-auth\.setup\.ts$/ },
		{
			name: "smoke",
			testMatch: /smoke-production\.spec\.ts/,
			use: { ...devices["Desktop Chrome"] },
		},
		{
			dependencies: ["setup"],
			name: "chromium",
			testIgnore: [/.*\.unauth\.spec\.ts/, /.*admin\.spec\.ts/],
			use: {
				...devices["Desktop Chrome"],
				storageState: "e2e/.auth/player.json",
			},
		},
		{
			dependencies: ["setup"],
			name: "webkit",
			testIgnore: [/.*\.unauth\.spec\.ts/, /.*admin\.spec\.ts/],
			use: {
				...devices["Desktop Safari"],
				storageState: "e2e/.auth/player.json",
			},
		},
		{
			name: "unauthenticated",
			testMatch: /.*\.unauth\.spec\.ts/,
			use: { ...devices["Desktop Chrome"] },
		},
		{
			dependencies: ["admin-setup"],
			name: "admin",
			testIgnore: /.*admin\.nonadmin\.spec\.ts/,
			testMatch: /.*admin\.spec\.ts/,
			use: {
				...devices["Desktop Chrome"],
				storageState: "e2e/.auth/admin.json",
			},
		},
		{
			dependencies: ["setup"],
			name: "non-admin",
			testMatch: /.*admin\.nonadmin\.spec\.ts/,
			use: {
				...devices["Desktop Chrome"],
				storageState: "e2e/.auth/player.json",
			},
		},
	],
	reporter: process.env.CI ? "github" : "html",
	retries: process.env.CI ? 2 : 0,
	testDir: "./e2e",
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:7743",
		screenshot: "only-on-failure",
		trace: "on-first-retry",
	},
	webServer: process.env.CI
		? undefined
		: {
				command: "pnpm dev",
				reuseExistingServer: true,
				timeout: 120_000,
				url: "http://localhost:7743",
			},
	workers: process.env.CI ? 1 : undefined,
});
