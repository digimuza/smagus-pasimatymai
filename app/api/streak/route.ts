import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { calculateStreak } from "@/lib/streaks";

export async function POST(req: NextRequest) {
	const payload = await getPayload({ config });

	const { user } = await payload.auth({ headers: req.headers });
	if (!user || user.collection !== "players") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const streakData = calculateStreak({
		currentStreak: (user as unknown as Record<string, unknown>).currentStreak as
			| number
			| undefined,
		lastPlayedDate: (user as unknown as Record<string, unknown>)
			.lastPlayedDate as string | undefined,
		longestStreak: (user as unknown as Record<string, unknown>).longestStreak as
			| number
			| undefined,
	});

	await payload.update({
		collection: "players",
		data: streakData,
		id: user.id,
	});

	return NextResponse.json(streakData);
}

export async function GET(req: NextRequest) {
	const payload = await getPayload({ config });

	const { user } = await payload.auth({ headers: req.headers });
	if (!user || user.collection !== "players") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	return NextResponse.json({
		currentStreak:
			(user as unknown as Record<string, unknown>).currentStreak || 0,
		lastPlayedDate:
			(user as unknown as Record<string, unknown>).lastPlayedDate || null,
		longestStreak:
			(user as unknown as Record<string, unknown>).longestStreak || 0,
	});
}
