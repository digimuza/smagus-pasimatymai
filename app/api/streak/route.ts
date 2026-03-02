import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { rateLimit } from "@/lib/rateLimit";
import { calculateStreak } from "@/lib/streaks";
import type { PlayerStreakFields } from "@/lib/streaks";

export async function POST(req: NextRequest) {
	try {
		const payload = await getPayload({ config });

		const { user } = await payload.auth({ headers: req.headers });
		if (!user || user.collection !== "players") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { success } = rateLimit(`streak:${user.id}`, {
			windowMs: 60_000,
			maxRequests: 10,
		});
		if (!success) {
			return NextResponse.json(
				{ error: "Too many requests" },
				{ status: 429 },
			);
		}

		const player = user as typeof user & PlayerStreakFields;

		const streakData = calculateStreak({
			currentStreak: player.currentStreak,
			lastPlayedDate: player.lastPlayedDate,
			longestStreak: player.longestStreak,
		});

		await payload.update({
			collection: "players",
			data: streakData,
			id: user.id,
		});

		return NextResponse.json(streakData);
	} catch (error) {
		console.error("Streak update error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		const payload = await getPayload({ config });

		const { user } = await payload.auth({ headers: req.headers });
		if (!user || user.collection !== "players") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const player = user as typeof user & PlayerStreakFields;

		return NextResponse.json({
			currentStreak: player.currentStreak || 0,
			lastPlayedDate: player.lastPlayedDate || null,
			longestStreak: player.longestStreak || 0,
		});
	} catch (error) {
		console.error("Streak fetch error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
