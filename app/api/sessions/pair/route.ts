import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/drizzle/db";
import { pairedSessions } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";
import { buildInviteUrl, generateInviteToken } from "@/lib/pairedSession";

const bodySchema = z.object({
	audience: z.enum(["romantic", "family", "kids", "friends"]),
	locale: z.enum(["lt", "en"]),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const parsed = bodySchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { audience, locale } = parsed.data;
	const inviteToken = generateInviteToken();
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

	const [session] = await db
		.insert(pairedSessions)
		.values({
			audience,
			expiresAt,
			initiatorPlayerId: player.id,
			inviteToken,
			locale,
		})
		.returning({
			expiresAt: pairedSessions.expiresAt,
			id: pairedSessions.id,
			inviteToken: pairedSessions.inviteToken,
		});

	return NextResponse.json({
		expiresAt: session.expiresAt,
		inviteToken: session.inviteToken,
		inviteUrl: buildInviteUrl(session.inviteToken),
		pairedSessionId: session.id,
	});
}
