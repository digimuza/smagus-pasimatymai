import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { rateLimit } from "@/lib/rateLimit";
import { analyticsBodySchema } from "@/lib/schemas";

export async function POST(request: Request) {
	const ip =
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		"unknown";
	const { success } = rateLimit(`analytics:${ip}`, {
		windowMs: 60_000,
		maxRequests: 30,
	});
	if (!success) {
		return NextResponse.json(
			{ error: "Too many requests" },
			{ status: 429 },
		);
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
		const payload = await getPayloadClient();

		// Insert validated events
		for (const event of events) {
			await payload.create({
				collection: "question-events",
				data: {
					eventType: event.eventType,
					questionId:
						typeof event.questionId === "number"
							? event.questionId
							: 0,
					sessionId: event.sessionId,
					timeSpent: event.timeSpent,
					timestamp: event.timestamp,
				},
			});
		}

		// Upsert session
		if (session) {
			const existing = await payload.find({
				collection: "game-sessions",
				limit: 1,
				where: { sessionId: { equals: session.sessionId } },
			});

			const sessionData = {
				audience: session.audience,
				device: session.device,
				endedAt: session.endedAt,
				locale: session.locale,
				questionsSkipped: session.questionsSkipped,
				questionsViewed: session.questionsViewed,
				sessionId: session.sessionId,
				spicyCardsViewed: session.spicyCardsViewed,
				startedAt: session.startedAt,
			};

			if (existing.docs.length > 0) {
				await payload.update({
					collection: "game-sessions",
					data: sessionData,
					id: existing.docs[0].id,
				});
			} else {
				try {
					await payload.create({
						collection: "game-sessions",
						data: sessionData,
					});
				} catch {
					// Unique constraint race condition — fall back to update
					const retry = await payload.find({
						collection: "game-sessions",
						limit: 1,
						where: { sessionId: { equals: session.sessionId } },
					});
					if (retry.docs.length > 0) {
						await payload.update({
							collection: "game-sessions",
							data: sessionData,
							id: retry.docs[0].id,
						});
					}
				}
			}
		}

		return NextResponse.json({
			eventsProcessed: events.length,
			ok: true,
		});
	} catch (error) {
		console.error("Analytics error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
