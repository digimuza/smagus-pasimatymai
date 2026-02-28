import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

const VALID_EVENT_TYPES = [
	"viewed",
	"skipped",
	"answered",
	"superliked",
	"spicy_dismissed",
];
const VALID_AUDIENCES = ["romantic", "family", "kids", "friends"];
const VALID_LOCALES = ["lt", "en"];

type ValidEventType = "answered" | "skipped" | "superliked" | "viewed" | "spicy_dismissed";

interface IncomingEvent {
	eventType: ValidEventType;
	questionId: number | string;
	sessionId: string;
	timeSpent?: number;
	timestamp: string;
}

interface IncomingSession {
	audience?: string;
	device?: string;
	endedAt?: string;
	locale?: string;
	questionsSkipped: number;
	questionsViewed: number;
	sessionId: string;
	spicyCardsViewed: number;
	startedAt: string;
}

function validateEvent(e: unknown): e is IncomingEvent {
	if (!e || typeof e !== "object") return false;
	const ev = e as Record<string, unknown>;
	return (
		typeof ev.sessionId === "string" &&
		(typeof ev.questionId === "number" || typeof ev.questionId === "string") &&
		typeof ev.eventType === "string" &&
		VALID_EVENT_TYPES.includes(ev.eventType) &&
		typeof ev.timestamp === "string"
	);
}

function validateSession(s: unknown): s is IncomingSession {
	if (!s || typeof s !== "object") return false;
	const sess = s as Record<string, unknown>;
	return (
		typeof sess.sessionId === "string" &&
		typeof sess.startedAt === "string" &&
		typeof sess.questionsViewed === "number" &&
		typeof sess.questionsSkipped === "number" &&
		typeof sess.spicyCardsViewed === "number"
	);
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { events, session } = body;

		if (!Array.isArray(events)) {
			return NextResponse.json(
				{ error: "events must be an array" },
				{ status: 400 },
			);
		}

		const payload = await getPayloadClient();

		// Validate and insert events
		const validEvents = events.filter(validateEvent);
		for (const event of validEvents) {
			await payload.create({
				collection: "question-events",
				data: {
					eventType: event.eventType,
					questionId:
						typeof event.questionId === "number" ? event.questionId : 0,
					sessionId: event.sessionId,
					timeSpent: event.timeSpent,
					timestamp: event.timestamp,
				},
			});
		}

		// Upsert session
		if (session && validateSession(session)) {
			const existing = await payload.find({
				collection: "game-sessions",
				limit: 1,
				where: { sessionId: { equals: session.sessionId } },
			});

			const sessionData = {
				audience: VALID_AUDIENCES.includes(session.audience ?? "")
					? (session.audience as "romantic" | "family" | "kids" | "friends")
					: undefined,
				device: session.device,
				endedAt: session.endedAt,
				locale: VALID_LOCALES.includes(session.locale ?? "")
					? (session.locale as "lt" | "en")
					: undefined,
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
				await payload.create({
					collection: "game-sessions",
					data: sessionData,
				});
			}
		}

		return NextResponse.json({ eventsProcessed: validEvents.length, ok: true });
	} catch (error) {
		console.error("Analytics error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
