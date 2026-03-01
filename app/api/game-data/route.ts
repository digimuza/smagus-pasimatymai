import config from "@payload-config";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { getAllCategoriesWithQuestions, getAllSpicyCards } from "@/lib/api";
import {
	canAccessAudience,
	canAccessSpicyCards,
	limitQuestions,
} from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	try {
		const payload = await getPayload({ config });
		const { user } = await payload.auth({ headers: request.headers });

		// Build subscription info for gating checks
		let subscription: { plan: string; status: string } | null = null;

		if (user && user.collection === "players") {
			const sub = await payload.find({
				collection: "subscriptions",
				limit: 1,
				overrideAccess: true,
				where: { player: { equals: user.id } },
			});
			if (sub.docs.length > 0) {
				subscription = {
					plan: sub.docs[0].plan,
					status: sub.docs[0].status,
				};
			}
		}

		const { searchParams } = new URL(request.url);
		const locale = searchParams.get("locale") || "lt";
		const audience = searchParams.get("audience") || "romantic";

		// Block premium audiences for non-premium users
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

		// Limit questions for free users
		const gatedSections = sections.map((section) => ({
			...section,
			questions: limitQuestions(section.questions, subscription),
		}));

		// Strip spicy cards for non-premium users
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
