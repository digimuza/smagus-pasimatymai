import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { players } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;
	if (player.id !== Number(id)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const body = await req.json();
	const allowed = [
		"name",
		"avatar",
		"locale",
		"preferredAudience",
		"activeCategories",
		"spicySettingsEnabled",
		"spicySettingsRarity",
		"spicySettingsEnabledTypes",
	] as const;

	const update: Record<string, unknown> = {};
	for (const key of allowed) {
		if (key in body) update[key] = body[key];
	}

	if (Object.keys(update).length === 0) {
		return NextResponse.json({ doc: player });
	}

	const [updated] = await db
		.update(players)
		.set({ ...update, updatedAt: new Date() })
		.where(eq(players.id, player.id))
		.returning();

	const { passwordHash: _, ...safePlayer } = updated;
	return NextResponse.json({ doc: safePlayer });
}
