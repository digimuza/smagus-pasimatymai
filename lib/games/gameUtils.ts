// Small utility helpers shared across the couple-games pages.

/** Fisher-Yates in-place shuffle. */
export function shuffle<T>(arr: readonly T[]): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

/** Pick `count` random items from `pool` without repeats. */
export function sample<T>(pool: readonly T[], count: number): T[] {
	if (count >= pool.length) return shuffle(pool);
	const copy = shuffle(pool);
	return copy.slice(0, count);
}

/** Stable id (UUID-like). Not cryptographic — just unique enough for
 *  localStorage notes and challenge entries. */
export function uid(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/** Clamp a number between min and max. */
export function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}

/** Pick a random element or `null` for empty arrays. */
export function pickRandom<T>(arr: readonly T[]): T | null {
	if (arr.length === 0) return null;
	return arr[Math.floor(Math.random() * arr.length)];
}
