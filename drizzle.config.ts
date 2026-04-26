import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dbCredentials: {
		url:
			process.env.DATABASE_URL ||
			"postgresql://payload:payload@localhost:5433/santykiuklausimai",
	},
	dialect: "postgresql",
	out: "./drizzle/migrations",
	schema: "./drizzle/schema/index.ts",
});
