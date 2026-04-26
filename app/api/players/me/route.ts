import { type NextRequest, NextResponse } from "next/server";
import { getAuthPlayer } from "@/lib/auth";

export async function GET(req: NextRequest) {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { passwordHash: _, ...safePlayer } = player;
	return NextResponse.json({ user: safePlayer });
}
