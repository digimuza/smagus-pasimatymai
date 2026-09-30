import type { TwoTruthsRound } from "@/types/games";

// Pre-made "Two Truths and a Lie" rounds. Use as a fallback when the players
// don't want to invent their own statements. Each round has 3 statements and
// one lie index.
export const TWO_TRUTHS_ROUNDS: TwoTruthsRound[] = [
	{
		id: "tt-1",
		lieIndex: 2,
		statements: [
			"Valgiau varliagyvius Azijoje",
			"Miegojau po atviru dangumi dykumoje",
			"Laimėjau nacionalinį šachmatų čempionatą",
		],
	},
	{
		id: "tt-2",
		lieIndex: 0,
		statements: [
			"Skraidau oro balionu virš Kapadokijos",
			"Mokiausi groti smuiku 5 metus",
			"Vaikštau basomis per žarijas festivalyje",
		],
	},
	{
		id: "tt-3",
		lieIndex: 1,
		statements: [
			"Parašiau trumpą novelę ir laimėjau konkursą",
			"Šokau su profesionaliu baleto trupės ansambliu",
			"Viena ranka sulankstiau origamį 1000 vienetų per dieną",
		],
	},
	{
		id: "tt-4",
		lieIndex: 2,
		statements: [
			"Mokiausi ženklų kalbą savarankiškai",
			"Dalyvavau TV realybės šou kaip dalyvis",
			"Vairavau formulės bolidą Lenkijos trasoje",
		],
	},
	{
		id: "tt-5",
		lieIndex: 0,
		statements: [
			"Bėgau maratoną greičiau nei per 4 valandas",
			"Augau name su 6 broliais ir seserimis",
			"Turėjau auksinę žuvelę, kuri išgyveno 12 metų",
		],
	},
	{
		id: "tt-6",
		lieIndex: 1,
		statements: [
			"Išmokau kalbą per 6 mėnesius iki B2 lygio",
			"Laimėjau boulingo turnyro finale išsisukinėjant kamuoliui",
			"Vienas nakvojau namely ant medžio",
		],
	},
	{
		id: "tt-7",
		lieIndex: 2,
		statements: [
			"Nardžiau prie nuskendusio laivo Egėjo jūroje",
			"Vaikštau slidėmis nuo kalno be pamokų",
			"Gaminau picą picerijos virtuvėje 8 valandas be pertraukos",
		],
	},
	{
		id: "tt-8",
		lieIndex: 0,
		statements: [
			"Sulaikiau kvėpavimą daugiau nei 5 minutes",
			"Lipau ant Everesto bazinio stovyklos",
			"Vos neiškritau iš lėktuvo parašiutu",
		],
	},
];
