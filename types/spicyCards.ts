export type SpicyCardType =
	| "kiss"
	| "challenge"
	| "compliment"
	| "massage"
	| "slap"
	| "whisper"
	| "dare"
	| "truth"
	| "hug"
	| "dance";

export type SpicyCardRarity =
	| "rare"
	| "semi-rare"
	| "medium"
	| "frequent"
	| "ultra";

export interface SpicyCard {
	color: string; // hex color for card background
	description: string;
	icon: string; // emoji
	id: string;
	title: string;
	type: SpicyCardType;
}

export interface SpicyCardSettings {
	enabled: boolean;
	enabledTypes: SpicyCardType[];
	rarity: SpicyCardRarity; // How often they appear (probability-based)
}

export const RARITY_PROBABILITIES: Record<SpicyCardRarity, number> = {
	frequent: 0.4, // 40% chance
	medium: 0.3, // 30% chance
	rare: 0.05, // 5% chance
	"semi-rare": 0.15, // 15% chance
	ultra: 0.5, // 50% chance
};
