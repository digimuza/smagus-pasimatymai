import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
	categories,
	questions,
	spicyCards,
	spicyCardTypes,
} from "@/drizzle/schema";

export async function getAllCategoriesWithQuestions(
	locale = "lt",
	audience = "romantic",
) {
	const cats = await db
		.select()
		.from(categories)
		.where(eq(categories.locale, locale as "lt" | "en"))
		.orderBy(categories.sortOrder);

	const allSections = await Promise.all(
		cats.map(async (cat) => {
			const qs = await db
				.select({ id: questions.id, question: questions.question })
				.from(questions)
				.where(
					and(
						eq(questions.categoryId, cat.id),
						eq(
							questions.audience,
							audience as "romantic" | "family" | "kids" | "friends",
						),
						eq(questions.locale, locale as "lt" | "en"),
						eq(questions.status, "published"),
					),
				)
				.orderBy(questions.legacyId);

			return {
				name: cat.name,
				questions: qs,
				range: `${qs.length} klausimų`,
				type: cat.type as "safe" | "intimate",
			};
		}),
	);

	return allSections.filter((s) => {
		if (s.questions.length === 0) return false;
		if (audience === "kids" && s.type === "intimate") return false;
		return true;
	});
}

export async function getAllSpicyCards(locale = "lt", audience = "romantic") {
	const cards = await db
		.select({
			color: spicyCardTypes.color,
			description: spicyCards.description,
			icon: spicyCardTypes.icon,
			id: spicyCards.id,
			slug: spicyCardTypes.slug,
			title: spicyCards.title,
		})
		.from(spicyCards)
		.innerJoin(spicyCardTypes, eq(spicyCards.cardTypeId, spicyCardTypes.id))
		.where(
			and(
				eq(
					spicyCards.audience,
					audience as "romantic" | "family" | "kids" | "friends",
				),
				eq(spicyCards.locale, locale as "lt" | "en"),
				eq(spicyCards.status, "published"),
			),
		);

	return cards.map((card) => ({
		color: card.color,
		description: card.description,
		icon: card.icon,
		id: String(card.id),
		title: card.title,
		type: card.slug,
	}));
}
