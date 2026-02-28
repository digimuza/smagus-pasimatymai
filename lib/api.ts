import { getPayloadClient } from "./payload";

export async function getAllCategoriesWithQuestions(
	locale = "lt",
	audience = "romantic",
) {
	const payload = await getPayloadClient();

	const categories = await payload.find({
		collection: "categories",
		limit: 100,
		sort: "sortOrder",
		where: { locale: { equals: locale } },
	});

	const allSections = await Promise.all(
		categories.docs.map(async (cat) => {
			const questions = await payload.find({
				collection: "questions",
				limit: 1000,
				sort: "legacyId",
				where: {
					audience: { equals: audience },
					category: { equals: cat.id },
					locale: { equals: locale },
					status: { equals: "published" },
				},
			});

			return {
				name: cat.name,
				questions: questions.docs.map((q) => ({
					id: q.id,
					question: q.question,
				})),
				range: `${questions.docs.length} klausimų`,
				type: cat.type as "safe" | "intimate",
			};
		}),
	);

	// Filter out empty sections and intimate sections for kids
	const sections = allSections.filter((s) => {
		if (s.questions.length === 0) return false;
		if (audience === "kids" && s.type === "intimate") return false;
		return true;
	});

	return sections;
}

export async function getAllSpicyCards(locale = "lt", audience = "romantic") {
	const payload = await getPayloadClient();

	const cards = await payload.find({
		collection: "spicy-cards",
		depth: 1,
		limit: 1000,
		where: {
			audience: { equals: audience },
			locale: { equals: locale },
			status: { equals: "published" },
		},
	});

	return cards.docs.map((card) => {
		const cardType = card.cardType as
			| { slug: string; icon: string; color: string }
			| number;
		const isPopulated = typeof cardType !== "number";

		return {
			color: isPopulated ? cardType.color : "",
			description: card.description,
			icon: isPopulated ? cardType.icon : "",
			id: String(card.id),
			title: card.title,
			type: isPopulated ? cardType.slug : "",
		};
	});
}
