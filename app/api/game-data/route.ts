import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { subscriptions } from "@/drizzle/schema";
import { getAllCategoriesWithQuestions, getAllSpicyCards } from "@/lib/api";
import { getAuthPlayer } from "@/lib/auth";
import {
	canAccessAudience,
	canAccessSpicyCards,
	limitQuestions,
} from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	try {
		const player = await getAuthPlayer(new Headers(request.headers));

		let subscription: { plan: string; status: string } | null = null;

		if (player) {
			const [sub] = await db
				.select({ plan: subscriptions.plan, status: subscriptions.status })
				.from(subscriptions)
				.where(eq(subscriptions.playerId, player.id))
				.limit(1);
			if (sub) subscription = { plan: sub.plan ?? "free", status: sub.status ?? "active" };
		}

		const { searchParams } = new URL(request.url);
		const locale = searchParams.get("locale") || "lt";
		const audience = searchParams.get("audience") || "romantic";

		if (!canAccessAudience(audience, subscription)) {
			return NextResponse.json(
				{ error: "Premium subscription required" },
				{ status: 403 },
			);
		}

		const [sections, spicyCards] = await Promise.all([
			getAllCategoriesWithQuestions(locale, audience),
			getAllSpicyCards(locale, audience),
		]);

		const gatedSections = sections.map((section) => ({
			...section,
			questions: limitQuestions(section.questions, subscription),
		}));

		const gatedSpicyCards = canAccessSpicyCards(subscription) ? spicyCards : [];

		const totalQuestions = gatedSections.reduce(
			(sum, s) => sum + s.questions.length,
			0,
		);

		return NextResponse.json({
			sections: gatedSections,
			spicyCards: gatedSpicyCards,
			title: `${totalQuestions} gilių klausimų`,
			total_questions: totalQuestions,
		});
	} catch (error) {
		console.error("Failed to fetch game data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch game data" },
			{ status: 500 },
		);
	}
}
