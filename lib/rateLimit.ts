import type { Redis } from "ioredis";
import { getRedis } from "./redis";

const _store = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
	maxRequests: number;
	windowMs: number;
}

// Atomic sliding-window via sorted set: remove expired members, count, then add if under limit
const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]

redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window_ms)
local count = redis.call('ZCARD', key)

if count >= limit then
  return {0, 0}
end

redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, window_ms)

return {1, limit - count - 1}
`;

async function redisRateLimit(
	redis: Redis,
	key: string,
	config: RateLimitConfig,
): Promise<{ success: boolean; remaining: number }> {
	const now = Date.now();
	const member = `${now}-${Math.random().toString(36).slice(2)}`;
	const result = (await redis.eval(
		SLIDING_WINDOW_SCRIPT,
		1,
		key,
		String(now),
		String(config.windowMs),
		String(config.maxRequests),
		member,
	)) as [number, number];
	return { remaining: result[1], success: result[0] === 1 };
}

function memoryRateLimit(
	key: string,
	config: RateLimitConfig,
): { success: boolean; remaining: number } {
	const now = Date.now();
	const entry = _store.get(key);

	if (!entry || now > entry.resetAt) {
		_store.set(key, { count: 1, resetAt: now + config.windowMs });
		return { remaining: config.maxRequests - 1, success: true };
	}

	if (entry.count >= config.maxRequests) {
		return { remaining: 0, success: false };
	}

	entry.count++;
	return { remaining: config.maxRequests - entry.count, success: true };
}

export async function rateLimit(
	key: string,
	config: RateLimitConfig,
): Promise<{ success: boolean; remaining: number }> {
	const redis = getRedis();

	if (redis) {
		try {
			return await redisRateLimit(redis, key, config);
		} catch {
			// Fall through to in-memory on Redis error (fail-open)
		}
	}

	return memoryRateLimit(key, config);
}

// Periodic cleanup for the in-memory fallback store
if (typeof globalThis !== "undefined") {
	const CLEANUP_INTERVAL = 60_000;
	setInterval(() => {
		const now = Date.now();
		for (const [k, entry] of _store) {
			if (now > entry.resetAt) _store.delete(k);
		}
	}, CLEANUP_INTERVAL).unref?.();
}
