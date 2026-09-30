import type { GameId, GameMeta } from "@/types/games";

// Hub metadata for the 6 couple games. Titles and descriptions live here as
// defaults — the UI translates them via i18n when displaying.
export const GAMES_META: Record<GameId, GameMeta> = {
	"daily-challenge": {
		color: "#34d399",
		description: "Kasdien naujas iššūkis jūsų porai",
		icon: "🔥",
		id: "daily-challenge",
		title: "Dienos iššūkis",
	},
	"date-jar": {
		color: "#fb7185",
		description: "Išsukite idėją — ir eikite kartu",
		icon: "🎁",
		id: "date-jar",
		title: "Pasimatymų stiklainis",
	},
	gratitude: {
		color: "#f59e0b",
		description: "Rašykite dėkingumo žinutes vienas kitam",
		icon: "🙏",
		id: "gratitude",
		title: "Dėkingumo stiklainis",
	},
	"love-map": {
		color: "#c084fc",
		description: "Patikrinkite, kaip gerai pažįstate vienas kitą",
		icon: "🗺️",
		id: "love-map",
		title: "Meilės žemėlapis",
	},
	"this-or-that": {
		color: "#60a5fa",
		description: 'Greiti "vienas ar kitas" klausimai',
		icon: "⚡",
		id: "this-or-that",
		title: "Šis ar tas?",
	},
	"two-truths": {
		color: "#a78bfa",
		description: "Trys teiginiai — vienas melas",
		icon: "🎭",
		id: "two-truths",
		title: "Dvi tiesos ir melas",
	},
};

// Order used on the hub. Curated so each game has a distinct color and emoji.
export const GAMES_HUB_ORDER: GameId[] = [
	"date-jar",
	"daily-challenge",
	"gratitude",
	"love-map",
	"this-or-that",
	"two-truths",
];

/** Map of game id → route path under the locale. */
export const GAME_ROUTES: Record<GameId, string> = {
	"daily-challenge": "/games/daily-challenge",
	"date-jar": "/games/date-jar",
	gratitude: "/games/gratitude",
	"love-map": "/games/love-map",
	"this-or-that": "/games/this-or-that",
	"two-truths": "/games/two-truths",
};
