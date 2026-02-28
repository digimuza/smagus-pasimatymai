export type AudienceSlug = "romantic" | "family" | "kids" | "friends";

export interface AudienceMetadata {
	color: string;
	description: string;
	icon: string;
	name: string;
	slug: AudienceSlug;
	sortOrder: number;
}

export const AUDIENCE_DEFAULTS: AudienceMetadata[] = [
	{
		color: "#9B59B6",
		description: "Klausimai, kurie padės geriau pažinti savo antrąją pusę",
		icon: "💜",
		name: "Poroms",
		slug: "romantic",
		sortOrder: 1,
	},
	{
		color: "#3498DB",
		description: "Šilti klausimai visai šeimai — nuo senelių iki vaikų",
		icon: "🏠",
		name: "Šeimai",
		slug: "family",
		sortOrder: 2,
	},
	{
		color: "#E67E22",
		description: "Klausimai draugų vakarams ir kompanijoms",
		icon: "🎉",
		name: "Draugams",
		slug: "friends",
		sortOrder: 3,
	},
	{
		color: "#2ECC71",
		description: "Linksmi ir saugūs klausimai mažiesiems",
		icon: "🌈",
		name: "Vaikams",
		slug: "kids",
		sortOrder: 4,
	},
];
