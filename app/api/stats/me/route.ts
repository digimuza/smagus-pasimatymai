import { and, count, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import {
	categories,
	gameSessions,
	playerProgress,
	questions,
} from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export interface PlayerStats {
	bestStreak: number;
	completedCategories: Array<{ id: number; name: string }>;
	currentStreak: number;
	totalAnswered: number;
	totalSessions: number;
	totalSuperliked: number;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { success } = await rateLimit(`stats:${player.id}`, {
		maxRequests: 30,
		windowMs: 60_000,
	});
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const playerLocale = (player.locale ?? "lt") as "lt" | "en";

	const [progressRows, sessionRows, localeCategories, localeQuestions] =
		await Promise.all([
			db
				.select({
					questionId: playerProgress.questionId,
					status: playerProgress.status,
				})
				.from(playerProgress)
				.where(eq(playerProgress.playerId, player.id)),
			db
				.select({ value: count() })
				.from(gameSessions)
				.where(eq(gameSessions.playerId, player.id)),
			db
				.select({ id: categories.id, name: categories.name })
				.from(categories)
				.where(eq(categories.locale, playerLocale)),
			db
				.select({ categoryId: questions.categoryId, id: questions.id })
				.from(questions)
				.where(
					and(
						eq(questions.locale, playerLocale),
						eq(questions.status, "published"),
					),
				),
		]);

	const totalAnswered = progressRows.filter(
		(r) => r.status === "answered",
	).length;
	const totalSuperliked = progressRows.filter(
		(r) => r.status === "superliked",
	).length;
	const totalSessions = sessionRows[0]?.value ?? 0;

	const answeredIds = new Set(
		progressRows
			.filter((r) => r.status === "answered" || r.status === "superliked")
			.map((r) => r.questionId),
	);

	const questionsByCategoryId = new Map<number, number[]>();
	for (const q of localeQuestions) {
		const arr = questionsByCategoryId.get(q.categoryId) ?? [];
		arr.push(q.id);
		questionsByCategoryId.set(q.categoryId, arr);
	}

	const completedCategories = localeCategories.filter((cat) => {
		const ids = questionsByCategoryId.get(cat.id);
		return ids && ids.length > 0 && ids.every((id) => answeredIds.has(id));
	});

	const stats: PlayerStats = {
		bestStreak: player.longestStreak ?? 0,
		completedCategories,
		currentStreak: player.currentStreak ?? 0,
		totalAnswered,
		totalSessions,
		totalSuperliked,
	};

	return NextResponse.json(stats);
}
