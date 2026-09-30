import type { LoveMapQuestion } from "@/types/games";

// "Love Map" — quiz about your partner. Each item is multiple-choice with a
// single correct answer. Multiple "correct" answer variations are deliberately
// avoided to keep scoring unambiguous (one guess per question, pass-and-play).
export const LOVE_MAP_QUESTIONS: LoveMapQuestion[] = [
	// Easy — surface-level preferences
	{
		correctIndex: 2,
		difficulty: "easy",
		id: "lm-1",
		options: ["Kava", "Arbata", "Kava su pienu", "Vanduo"],
		prompt: "Koks yra tavo partnerio mėgstamiausias rytinis gėrimas?",
	},
	{
		correctIndex: 0,
		difficulty: "easy",
		id: "lm-2",
		options: ["Šuo", "Katė", "Žuvelės", "Nė vieno"],
		prompt: "Kokį augintinį tavo partneris norėtų turėti?",
	},
	{
		correctIndex: 1,
		difficulty: "easy",
		id: "lm-3",
		options: ["Pica", "Sushi", "Pasta", "Blynai"],
		prompt: "Koks patiekalas yra tikrasis tavo partnerio silpnumas?",
	},
	{
		correctIndex: 2,
		difficulty: "easy",
		id: "lm-4",
		options: ["Vasarą", "Žiemą", "Pavasarį", "Rudenį"],
		prompt: "Koks sezonas yra tavo partnerio mėgstamiausias?",
	},
	{
		correctIndex: 1,
		difficulty: "easy",
		id: "lm-5",
		options: ["Komija", "Drama", "Siaubo", "Dokumentika"],
		prompt: "Koks žanras filmų labiausiai patinka tavo partneriui?",
	},
	{
		correctIndex: 0,
		difficulty: "easy",
		id: "lm-6",
		options: ["Pop", "Rokas", "Elektroninė", "Klasika"],
		prompt: "Kokia muzika dažniausiai skamba tavo partnerio telefone?",
	},

	// Medium — habits and preferences
	{
		correctIndex: 2,
		difficulty: "medium",
		id: "lm-7",
		options: ["Labai anksti", "Vidutiniškai", "Vėlai", "Tik savaitgaliais"],
		prompt: "Kada tavo partneris natūraliai atsibunda be žadintuvo?",
	},
	{
		correctIndex: 0,
		difficulty: "medium",
		id: "lm-8",
		options: ["Maisto gaminimas", "Skaitymas", "Sportas", "Serialai"],
		prompt: "Kuo tavo partneris užsiima, kai turi laisvą valandą?",
	},
	{
		correctIndex: 1,
		difficulty: "medium",
		id: "lm-9",
		options: ["Kalnuose", "Prie jūros", "Miške", "Užsienyje"],
		prompt: "Kokia vieta yra tavo partnerio svajonių atostogos?",
	},
	{
		correctIndex: 2,
		difficulty: "medium",
		id: "lm-10",
		options: ["Parduotuvėse", "Internete", "Turguje", "Sena būdu"],
		prompt: "Kaip tavo partneris mėgsta apsipirkti?",
	},
	{
		correctIndex: 0,
		difficulty: "medium",
		id: "lm-11",
		options: ["Kiti žmonės", "Knygos", "Filmai", "Kelionės"],
		prompt: "Kas labiausiai įkvepia tavo partnerį?",
	},
	{
		correctIndex: 1,
		difficulty: "medium",
		id: "lm-12",
		options: ["Vakare", "Ryte", "Po pietų", "Bet kada"],
		prompt: "Kada tavo partneris yra labiausiai kūrybingas?",
	},

	// Deep — values, fears, dreams
	{
		correctIndex: 0,
		difficulty: "deep",
		id: "lm-13",
		options: ["Šeima", "Karjera", "Laisvė", "Sveikata"],
		prompt: "Kas yra svarbiausia tavo partnerio gyvenime?",
	},
	{
		correctIndex: 2,
		difficulty: "deep",
		id: "lm-14",
		options: [
			"Neturėti gėdos",
			"Visuomet padėti kitiems",
			"Išreikšti save laisvai",
			"Būti mylimam",
		],
		prompt: "Ko tavo partneris labiausiai bijo?",
	},
	{
		correctIndex: 1,
		difficulty: "deep",
		id: "lm-15",
		options: ["Svetur", "Kitame mieste", "Nieko nekeisti", "Grįžti į gimtinę"],
		prompt: "Kur tavo partneris svajoja gyventi po 10 metų?",
	},
	{
		correctIndex: 2,
		difficulty: "deep",
		id: "lm-16",
		options: [
			"Profesinis pasiekimas",
			"Kūrinys (knyga, filmas)",
			"Santykių kokybė",
			"Materialus dalykas",
		],
		prompt: "Koks pasiekimas tavo partneriui labiausiai reikštų sėkmę?",
	},
	{
		correctIndex: 0,
		difficulty: "deep",
		id: "lm-17",
		options: ["Tėvai", "Draugai", "Broliai/seserys", "Vienas"],
		prompt: "Kas yra didžiausias tavo partnerio autoritetas?",
	},
	{
		correctIndex: 1,
		difficulty: "deep",
		id: "lm-18",
		options: ["Vienatvė", "Netektis", "Nesėkmė", "Pasikeitimas"],
		prompt: "Ko tavo partneris labiausiai stengiasi išvengti gyvenime?",
	},
];
