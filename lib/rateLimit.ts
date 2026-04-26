const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
	maxRequests: number;
	windowMs: number;
}

export function rateLimit(
	key: string,
	config: RateLimitConfig,
): { success: boolean; remaining: number } {
	const now = Date.now();
	const entry = rateLimitMap.get(key);

	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
		return { remaining: config.maxRequests - 1, success: true };
	}

	if (entry.count >= config.maxRequests) {
		return { remaining: 0, success: false };
	}

	entry.count++;
	return { remaining: config.maxRequests - entry.count, success: true };
}

// Periodic cleanup to prevent memory leaks in long-running processes
if (typeof globalThis !== "undefined") {
	const CLEANUP_INTERVAL = 60_000;
	setInterval(() => {
		const now = Date.now();
		for (const [key, entry] of rateLimitMap) {
			if (now > entry.resetAt) rateLimitMap.delete(key);
		}
	}, CLEANUP_INTERVAL).unref?.();
}
