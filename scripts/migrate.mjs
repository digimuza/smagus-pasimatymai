import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { dirname, join } from "node:path";
import postgres from "postgres";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
	console.error("DATABASE_URL is required");
	process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

console.log("Running database migrations...");
await migrate(db, {
	migrationsFolder: join(__dirname, "../drizzle/migrations"),
});
console.log("Migrations complete");
await client.end();
