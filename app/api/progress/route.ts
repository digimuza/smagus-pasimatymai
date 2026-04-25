import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { playerProgress } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { progressBodySchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const audience = req.nextUrl.searchParams.get("audience");

	const conditions = audience
		? and(
				eq(playerProgress.playerId, player.id),
				eq(
					playerProgress.audience,
					audience as "romantic" | "family" | "kids" | "friends",
				),
			)
		: eq(playerProgress.playerId, player.id);

	const docs = await db
		.select({
			audience: playerProgress.audience,
			questionId: playerProgress.questionId,
			status: playerProgress.status,
			viewedAt: playerProgress.viewedAt,
		})
		.from(playerProgress)
		.where(conditions)
		.orderBy(playerProgress.viewedAt)
		.limit(10000);

	return NextResponse.json({ docs });
}

export async function POST(req: NextRequest) {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { success } = rateLimit(`progress:${player.id}`, {
		maxRequests: 20,
		windowMs: 60_000,
	});
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const body = await req.json();
	const parsed = progressBodySchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { items } = parsed.data;
	let created = 0;
	let updated = 0;

	for (const item of items) {
		const [existing] = await db
			.select({ id: playerProgress.id })
			.from(playerProgress)
			.where(
				and(
					eq(playerProgress.playerId, player.id),
					eq(playerProgress.questionId, item.questionId),
					eq(
						playerProgress.audience,
						item.audience as "romantic" | "family" | "kids" | "friends",
					),
				),
			)
			.limit(1);

		if (existing) {
			await db
				.update(playerProgress)
				.set({
					status: item.status as "answered" | "skipped" | "superliked",
					updatedAt: new Date(),
					viewedAt: item.viewedAt ? new Date(item.viewedAt) : new Date(),
				})
				.where(eq(playerProgress.id, existing.id));
			updated++;
		} else {
			await db.insert(playerProgress).values({
				audience: item.audience as "romantic" | "family" | "kids" | "friends",
				playerId: player.id,
				questionId: item.questionId,
				status: item.status as "answered" | "skipped" | "superliked",
				viewedAt: item.viewedAt ? new Date(item.viewedAt) : new Date(),
			});
			created++;
		}
	}

	return NextResponse.json({ created, updated });
}

export async function DELETE(req: NextRequest) {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	await db.delete(playerProgress).where(eq(playerProgress.playerId, player.id));

	return NextResponse.json({ success: true });
}
