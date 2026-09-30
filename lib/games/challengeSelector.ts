import { COUPLE_CHALLENGES } from "@/lib/games/dailyChallengesData";
import type { CoupleChallenge } from "@/types/games";

// Date-based deterministic seeding. We hash the yyyy-mm-dd string to pick a
// challenge. Same day for every user = same challenge globally.
function hashDate(dateKey: string): number {
	let hash = 0;
	for (let i = 0; i < dateKey.length; i++) {
		hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
	}
	return hash;
}

/** Returns today's challenge for the user's timezone. */
export function getTodaysChallenge(now = new Date()): {
	challenge: CoupleChallenge;
	day: string;
} {
	const day = formatDateKey(now);
	const idx = hashDate(day) % COUPLE_CHALLENGES.length;
	return { challenge: COUPLE_CHALLENGES[idx], day };
}

/** "yyyy-mm-dd" in local time. */
export function formatDateKey(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

/** Number of full days between two date keys (b - a). */
export function daysBetween(a: Date, b: Date): number {
	const aKey = formatDateKey(a);
	const bKey = formatDateKey(b);
	const aMs = Date.parse(aKey);
	const bMs = Date.parse(bKey);
	return Math.round((bMs - aMs) / (1000 * 60 * 60 * 24));
}
