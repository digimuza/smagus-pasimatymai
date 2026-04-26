import Redis from "ioredis";

let client: Redis | null = null;

export function getRedis(): Redis | null {
	if (!process.env.REDIS_URL) return null;

	if (!client) {
		client = new Redis(process.env.REDIS_URL, {
			connectTimeout: 2_000,
			lazyConnect: true,
			maxRetriesPerRequest: 1,
		});
		client.on("error", () => {
			// Suppressed: call sites catch and fall back to in-memory
		});
	}

	return client;
}
