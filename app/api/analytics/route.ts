import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { gameSessions, questionEvents } from "@/drizzle/schema";
import { rateLimit } from "@/lib/rateLimit";
import { analyticsBodySchema } from "@/lib/schemas";

export async function POST(request: Request) {
	const ip =
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
	const { success } = rateLimit(`analytics:${ip}`, {
		maxRequests: 30,
		windowMs: 60_000,
	});
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	try {
		const body = await request.json();
		const parsed = analyticsBodySchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		const { events, session } = parsed.data;

		if (events.length > 0) {
			await db.insert(questionEvents).values(
				events.map((event) => ({
					eventType: event.eventType,
					questionId:
						typeof event.questionId === "number"
							? event.questionId
							: parseInt(String(event.questionId), 10),
					sessionId: event.sessionId,
					timeSpent: event.timeSpent ?? null,
					timestamp: new Date(event.timestamp),
				})),
			);
		}

		if (session) {
			await db
				.insert(gameSessions)
				.values({
					audience: (session.audience ?? null) as
						| "romantic"
						| "family"
						| "kids"
						| "friends"
						| null,
					device: session.device ?? null,
					endedAt: session.endedAt ? new Date(session.endedAt) : null,
					locale: (session.locale ?? null) as "lt" | "en" | null,
					questionsSkipped: session.questionsSkipped,
					questionsViewed: session.questionsViewed,
					sessionId: session.sessionId,
					spicyCardsViewed: session.spicyCardsViewed,
					startedAt: new Date(session.startedAt),
				})
				.onConflictDoUpdate({
					set: {
						device: session.device ?? null,
						endedAt: session.endedAt ? new Date(session.endedAt) : null,
						questionsSkipped: session.questionsSkipped,
						questionsViewed: session.questionsViewed,
						spicyCardsViewed: session.spicyCardsViewed,
						updatedAt: new Date(),
					},
					target: gameSessions.sessionId,
				});
		}

		return NextResponse.json({ eventsProcessed: events.length, ok: true });
	} catch (error) {
		console.error("Analytics error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
