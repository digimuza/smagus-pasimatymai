import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/drizzle/db";
import { subscriptions } from "@/drizzle/schema";
import { getQuestionsPage } from "@/lib/api";
import { getAuthPlayer } from "@/lib/auth";
import { PAGE_SIZE } from "@/lib/pagination";
import { canAccessAudience, isPremium } from "@/lib/subscription";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
	audience: z.string().default("romantic"),
	excludeIds: z.array(z.number().int().positive()).default([]),
	limit: z.number().int().min(1).max(200).default(PAGE_SIZE),
	locale: z.string().default("lt"),
});

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const raw = await request.json();
		const parsed = bodySchema.safeParse(raw);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid parameters" },
				{ status: 400 },
			);
		}

		const { audience, excludeIds, limit, locale } = parsed.data;

		const player = await getAuthPlayer(new Headers(request.headers));
		let subscription: { plan: string; status: string } | null = null;

		if (player) {
			const [sub] = await db
				.select({ plan: subscriptions.plan, status: subscriptions.status })
				.from(subscriptions)
				.where(eq(subscriptions.playerId, player.id))
				.limit(1);
			if (sub)
				subscription = {
					plan: sub.plan ?? "free",
					status: sub.status ?? "active",
				};
		}

		if (!canAccessAudience(audience, subscription)) {
			return NextResponse.json(
				{ error: "Premium subscription required" },
				{ status: 403 },
			);
		}

		// Free users are fully served by the initial game-data load
		if (!isPremium(subscription)) {
			return NextResponse.json({
				hasMore: false,
				questions: [],
				totalCount: 0,
			});
		}

		const page = await getQuestionsPage(locale, audience, excludeIds, limit);

		return NextResponse.json(page);
	} catch (error) {
		console.error("Failed to fetch question page:", error);
		return NextResponse.json(
			{ error: "Failed to fetch questions" },
			{ status: 500 },
		);
	}
}
