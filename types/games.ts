// Shared types for the couple-games suite (Date Jar, This or That, Love Map,
// Daily Challenge, Gratitude Jar, Two Truths and a Lie).

export type GameId =
	| "date-jar"
	| "this-or-that"
	| "love-map"
	| "daily-challenge"
	| "gratitude"
	| "two-truths";

export interface GameMeta {
	/** Hex color used for accent on the game card. */
	color: string;
	/** Short Lithuanian tagline, used on hub card. */
	description: string;
	/** Emoji shown on hub card and header. */
	icon: string;
	/** Short ID for routing (e.g. "date-jar"). */
	id: GameId;
	/** Human-readable name in Lithuanian (default locale). */
	title: string;
}

// --- Date Night Jar ---------------------------------------------------------
export type DateCategory = "home" | "outdoor" | "food" | "romantic" | "fun";

export interface DateIdea {
	category: DateCategory;
	duration: string; // free-form duration, e.g. "1-2 val."
	icon: string;
	id: string;
	intensity: "cozy" | "active" | "spicy";
	prompt: string;
}

// --- This or That -----------------------------------------------------------
export interface ThisOrThatPair {
	/** Text in Lithuanian (default locale). */
	a: string;
	b: string;
	/** Optional emoji for option A. */
	iconA?: string;
	/** Optional emoji for option B. */
	iconB?: string;
	id: string;
}

// --- Love Map (questions about partner) ------------------------------------
export type LoveMapDifficulty = "easy" | "medium" | "deep";

export interface LoveMapQuestion {
	correctIndex: number;
	difficulty: LoveMapDifficulty;
	id: string;
	// Multiple-choice options (correct is one of them).
	options: string[];
	prompt: string; // "Kokia yra tavo partnerio mėgstamiausia daina?"
}

// --- Daily Couple Challenge -------------------------------------------------
export type ChallengeCategory =
	| "connection"
	| "fun"
	| "romantic"
	| "growth"
	| "kindness";

export interface CoupleChallenge {
	category: ChallengeCategory;
	/** ISO date (yyyy-mm-dd) for deterministic day mapping. Not used at runtime
	 * — the date is the hash seed. Defined here so editors can also pin a date. */
	day?: string;
	description: string;
	duration: string; // e.g. "5 min", "1 val."
	icon: string;
	id: string;
	title: string;
}

// --- Gratitude Jar ----------------------------------------------------------
export interface GratitudeNote {
	/** Free-form author label. Defaults to "A" / "B" in pass-and-play mode. */
	author: string;
	authoredAt: string; // ISO datetime
	id: string;
	text: string;
}

export interface GratitudeJar {
	notes: GratitudeNote[];
}

// --- Two Truths and a Lie ---------------------------------------------------
export interface TwoTruthsRound {
	id: string;
	/** Zero-based index of the lie inside `statements`. */
	lieIndex: number;
	/** Three statements; one of them is the lie. */
	statements: string[];
}

// --- Pass-and-play helpers --------------------------------------------------
export type PlayerSlot = "A" | "B";

export interface PlayerScore {
	correct: number;
	total: number;
}

export type PlayerScores = Record<PlayerSlot, PlayerScore>;
