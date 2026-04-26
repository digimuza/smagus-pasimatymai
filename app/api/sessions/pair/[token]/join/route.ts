import { and, eq, isNull, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { pairedSessions, players } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";
import { isTokenExpired } from "@/lib/pairedSession";

interface RouteContext {
	params: Promise<{ token: string }>;
}

export async function POST(
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
		return NextResponse.json({ error: "Invite not found" }, { status: 404 });
	}

	if (isTokenExpired(session.expiresAt)) {
		return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
	}

	if (session.initiatorPlayerId === player.id) {
		return NextResponse.json({ error: "own_link" }, { status: 409 });
	}

	if (
		session.partnerPlayerId !== null &&
		session.partnerPlayerId !== player.id
	) {
		return NextResponse.json(
			{ error: "Session already has a partner" },
			{ status: 409 },
		);
	}

	await db
		.update(pairedSessions)
		.set({
			partnerPlayerId: player.id,
			status: "active",
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(pairedSessions.id, session.id),
				or(
					isNull(pairedSessions.partnerPlayerId),
					eq(pairedSessions.partnerPlayerId, player.id),
				),
			),
		);

	const [initiator] = await db
		.select({ name: players.name })
		.from(players)
		.where(eq(players.id, session.initiatorPlayerId))
		.limit(1);

	return NextResponse.json({
		audience: session.audience,
		initiatorName: initiator?.name ?? null,
		locale: session.locale,
		pairedSessionId: session.id,
	});
}
