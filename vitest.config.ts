import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": resolve(__dirname),
		},
	},
	test: {
		coverage: {
			exclude: ["**/__tests__/**", "**/*.d.ts", "**/node_modules/**"],
			include: ["lib/**/*.ts", "app/**/*.ts", "components/**/*.ts"],
			provider: "v8",
			reporter: ["text", "lcov", "html"],
			thresholds: {
				branches: 60,
				functions: 60,
				lines: 60,
				statements: 60,
			},
		},
		include: ["**/__tests__/**/*.test.ts"],
	},
});
