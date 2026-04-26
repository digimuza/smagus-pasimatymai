import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [
			{
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
				"app/**/*.ts",
				"components/**/*.ts",
				"components/**/*.tsx",
				"hooks/**/*.ts",
			],
			provider: "v8",
			reporter: ["text", "lcov", "html"],
			thresholds: {
				branches: 60,
				functions: 60,
				lines: 60,
				statements: 60,
			},
		},
		environment: "jsdom",
		include: ["**/__tests__/**/*.test.{ts,tsx}"],
		server: {
			deps: {
				// Keep next-intl and next external so Vite doesn't try to bundle
				// them; component tests mock these at the vi.mock() level.
				// WHY: next-intl imports next/navigation at module evaluation time
				// which fails in jsdom — mocking before bundling avoids the error.
				external: [/node_modules\/next/, /node_modules\/next-intl/],
			},
		},
		setupFiles: ["./vitest.setup.ts"],
	},
});
