import { test as base } from "@playwright/test";

export const test = base.extend<{
	testPlayer: { email: string; name: string };
}>({
	// biome-ignore lint/correctness/noEmptyPattern: Playwright fixture pattern requires destructuring
	testPlayer: async ({}, use) => {
		await use({
			email: "e2e-test@example.com",
			name: "E2E Test Player",
		});
	},
});

export { expect } from "@playwright/test";
