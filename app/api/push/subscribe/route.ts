import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { pushSubscriptions } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";
import { pushSubscribeSchema } from "@/lib/schemas";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const parsed = pushSubscribeSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid subscription data" },
			{ status: 400 },
		);
	}

	const { endpoint, p256dh, auth, frequency, locale } = parsed.data;

	// Upsert: if same player+endpoint exists update frequency; otherwise insert
	const existing = await db
		.select({ id: pushSubscriptions.id })
		.from(pushSubscriptions)
		.where(
			and(
				eq(pushSubscriptions.playerId, player.id),
				eq(pushSubscriptions.endpoint, endpoint),
			),
		)
		.limit(1);

	if (existing.length > 0) {
		await db
			.update(pushSubscriptions)
			.set({
				auth,
				frequency,
				locale: locale ?? player.locale ?? "lt",
				p256dh,
				updatedAt: new Date(),
			})
			.where(eq(pushSubscriptions.id, existing[0].id));
	} else {
		await db.insert(pushSubscriptions).values({
			auth,
			endpoint,
			frequency,
			locale: locale ?? player.locale ?? "lt",
			p256dh,
			playerId: player.id,
		});
	}

	return NextResponse.json({ ok: true }, { status: 200 });
}
