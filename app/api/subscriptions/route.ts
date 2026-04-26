import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { subscriptions } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";

export async function GET(req: NextRequest) {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ docs: [] });
	}

	const playerIdParam = req.nextUrl.searchParams.get("where[player][equals]");
	const playerId = playerIdParam ? Number(playerIdParam) : player.id;

	if (playerId !== player.id) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const docs = await db
		.select()
		.from(subscriptions)
		.where(eq(subscriptions.playerId, playerId))
		.limit(1);

	return NextResponse.json({ docs });
}
