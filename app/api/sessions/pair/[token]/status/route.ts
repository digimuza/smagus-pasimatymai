import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { pairedSessions, players } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";

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
		return NextResponse.json({ error: "Invite not found" }, { status: 404 });
	}

	const isParticipant =
		session.initiatorPlayerId === player.id ||
		session.partnerPlayerId === player.id;

	if (!isParticipant) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	let partnerName: string | null = null;
	if (session.partnerPlayerId) {
		const [partner] = await db
			.select({ name: players.name })
			.from(players)
			.where(eq(players.id, session.partnerPlayerId))
			.limit(1);
		partnerName = partner?.name ?? null;
	}

	return NextResponse.json({
		partnerJoined: session.partnerPlayerId !== null,
		partnerName,
		status: session.status,
	});
}
