import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { pushSubscriptions } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";

export async function DELETE(req: NextRequest): Promise<NextResponse> {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	await db
		.delete(pushSubscriptions)
		.where(and(eq(pushSubscriptions.playerId, player.id)));

	return NextResponse.json({ ok: true }, { status: 200 });
}
