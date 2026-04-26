import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { playerProgress } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { ACTION_TO_STATUS, swipeActionSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { success } = rateLimit(`swipe:${player.id}`, {
		maxRequests: 60,
		windowMs: 60_000,
	});
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const body = await req.json();
	const parsed = swipeActionSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { questionId, action, audience, timestamp } = parsed.data;
	const status = ACTION_TO_STATUS[action];
	const viewedAt = timestamp ? new Date(timestamp) : new Date();

	const [existing] = await db
		.select({ id: playerProgress.id })
		.from(playerProgress)
		.where(
			and(
				eq(playerProgress.playerId, player.id),
				eq(playerProgress.questionId, questionId),
				eq(playerProgress.audience, audience),
			),
		)
		.limit(1);

	if (existing) {
		await db
			.update(playerProgress)
			.set({ status, updatedAt: new Date(), viewedAt })
			.where(eq(playerProgress.id, existing.id));
	} else {
		await db.insert(playerProgress).values({
			audience,
			playerId: player.id,
			questionId,
			status,
			viewedAt,
		});
	}

	return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const audience = req.nextUrl.searchParams.get("audience") as
		| "romantic"
		| "family"
		| "kids"
		| "friends"
		| null;

	const conditions = audience
		? and(
				eq(playerProgress.playerId, player.id),
				eq(playerProgress.audience, audience),
			)
		: eq(playerProgress.playerId, player.id);

	const responses = await db
		.select({
			action: playerProgress.status,
			audience: playerProgress.audience,
			questionId: playerProgress.questionId,
			timestamp: playerProgress.viewedAt,
		})
		.from(playerProgress)
		.where(conditions)
		.orderBy(playerProgress.viewedAt)
		.limit(10000);

	return NextResponse.json({ responses, seenCount: responses.length });
}
