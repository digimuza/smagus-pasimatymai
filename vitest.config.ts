import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [
			{
				// WHY: next-intl imports next/navigation at module evaluation time,
				// which doesn't resolve in jsdom. Redirect to a stub so component
				// tests can load without the Next.js runtime.
				find: /^next\/navigation$/,
				replacement: resolve(__dirname, "__mocks__/next-navigation.ts"),
			},
			{
				find: "@/i18n/navigation",
				replacement: resolve(__dirname, "__mocks__/next-navigation.ts"),
			},
			{ find: "@", replacement: resolve(__dirname) },
		],
	},
	test: {
		coverage: {
			exclude: ["**/__tests__/**", "**/*.d.ts", "**/node_modules/**"],
			include: [
				"lib/**/*.ts",
				"hooks/useSwipeGesture.ts",
				"components/SwipeCard.tsx",
				"components/CardDeck.tsx",
			],
			provider: "v8",
			reporter: ["text", "lcov", "html"],
			thresholds: {
				branches: 80,
				functions: 80,
				lines: 80,
				statements: 80,
			},
		},
		environment: "jsdom",
		include: ["**/__tests__/**/*.test.{ts,tsx}"],
		server: {
			deps: {
				// WHY: next-intl imports next/navigation at evaluation time. Inlining
				// it through Vite lets the alias above redirect next/navigation to our
				// stub before Node.js resolution runs (which would fail in jsdom).
				inline: [/next-intl/],
			},
		},
		setupFiles: ["./vitest.setup.ts"],
	},
});
