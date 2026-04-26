import { and, count, eq, ne, notInArray } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
	categories,
	questions,
	spicyCards,
	spicyCardTypes,
} from "@/drizzle/schema";
import type { PagedQuestion, QuestionPageResult } from "./pagination";

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

export async function getQuestionsPage(
	locale: string,
	audience: string,
	excludeIds: number[],
	limit: number,
): Promise<QuestionPageResult> {
	const audienceVal = audience as "romantic" | "family" | "kids" | "friends";
	const localeVal = locale as "lt" | "en";
	const kidsFilter =
		audience === "kids" ? ne(categories.type, "intimate") : undefined;

	const [countResult] = await db
		.select({ total: count() })
		.from(questions)
		.innerJoin(categories, eq(questions.categoryId, categories.id))
		.where(
			and(
				eq(questions.audience, audienceVal),
				eq(questions.locale, localeVal),
				eq(questions.status, "published"),
				kidsFilter,
			),
		);

	const totalCount = Number(countResult?.total ?? 0);

	const rows = await db
		.select({
			categoryName: categories.name,
			id: questions.id,
			question: questions.question,
		})
		.from(questions)
		.innerJoin(categories, eq(questions.categoryId, categories.id))
		.where(
			and(
				eq(questions.audience, audienceVal),
				eq(questions.locale, localeVal),
				eq(questions.status, "published"),
				excludeIds.length > 0
					? notInArray(questions.id, excludeIds)
					: undefined,
				kidsFilter,
			),
		)
		.orderBy(questions.id)
		.limit(limit + 1);

	const hasMore = rows.length > limit;

	return {
		hasMore,
		questions: rows.slice(0, limit) as PagedQuestion[],
		totalCount,
	};
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
