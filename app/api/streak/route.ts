import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { players } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { calculateStreak } from "@/lib/streaks";

export async function POST(req: NextRequest) {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { success } = await rateLimit(`streak:${player.id}`, {
		maxRequests: 10,
		windowMs: 60_000,
	});
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const streakData = calculateStreak({
		currentStreak: player.currentStreak ?? undefined,
		lastPlayedDate: player.lastPlayedDate ?? undefined,
		longestStreak: player.longestStreak ?? undefined,
	});

	await db
		.update(players)
		.set({ ...streakData, updatedAt: new Date() })
		.where(eq(players.id, player.id));

	return NextResponse.json(streakData);
}

export async function GET(req: NextRequest) {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	return NextResponse.json({
		currentStreak: player.currentStreak ?? 0,
		lastPlayedDate: player.lastPlayedDate ?? null,
		longestStreak: player.longestStreak ?? 0,
	});
}
