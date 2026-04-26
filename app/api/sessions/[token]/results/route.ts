import { eq, inArray } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { pairedSessions, playerProgress, questions } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";
import { computeResults, isTokenExpired } from "@/lib/pairedSession";

interface RouteContext {
	params: Promise<{ token: string }>;
}

export async function GET(
	req: NextRequest,
	{ params }: RouteContext,
): Promise<NextResponse> {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { token } = await params;

	const [session] = await db
		.select()
		.from(pairedSessions)
		.where(eq(pairedSessions.inviteToken, token))
		.limit(1);

	if (!session) {
		return NextResponse.json({ error: "Session not found" }, { status: 404 });
	}

	if (isTokenExpired(session.expiresAt)) {
		return NextResponse.json({ error: "Session has expired" }, { status: 410 });
	}

	const isParticipant =
		session.initiatorPlayerId === player.id ||
		session.partnerPlayerId === player.id;

	if (!isParticipant) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	if (!session.partnerPlayerId) {
		return NextResponse.json(
			{ error: "Partner has not joined yet" },
			{ status: 422 },
		);
	}

	const isInitiator = session.initiatorPlayerId === player.id;
	const myPlayerId = player.id;
	const partnerPlayerId = isInitiator
		? session.partnerPlayerId
		: session.initiatorPlayerId;

	const [myProgress, partnerProgress] = await Promise.all([
		db
			.select({ questionId: playerProgress.questionId, status: playerProgress.status })
			.from(playerProgress)
			.where(eq(playerProgress.playerId, myPlayerId)),
		db
			.select({ questionId: playerProgress.questionId, status: playerProgress.status })
			.from(playerProgress)
			.where(eq(playerProgress.playerId, partnerPlayerId)),
	]);

	const allQuestionIds = [
		...new Set([
			...myProgress.map((r) => r.questionId),
			...partnerProgress.map((r) => r.questionId),
		]),
	];

	const questionRows =
		allQuestionIds.length > 0
			? await db
					.select({ id: questions.id, question: questions.question })
					.from(questions)
					.where(inArray(questions.id, allQuestionIds))
			: [];

	const results = computeResults(myProgress, partnerProgress, questionRows);

	return NextResponse.json(results);
}
