import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { players } from "@/drizzle/schema";
import { COOKIE_NAME, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
	const { email, password } = await req.json();

	if (!email || !password) {
		return NextResponse.json(
			{ error: "email and password required" },
			{ status: 400 },
		);
	}

	const [player] = await db
		.select()
		.from(players)
		.where(eq(players.email, email))
		.limit(1);

	if (!player || !player.passwordHash) {
		return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	}

	const valid = await bcrypt.compare(password, player.passwordHash);
	if (!valid) {
		return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	}

	const token = await signToken(player.id, player.email);

	const { passwordHash: _, ...safePlayer } = player;
	const response = NextResponse.json({ token, user: safePlayer });
	response.cookies.set(COOKIE_NAME, token, {
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 30,
		path: "/",
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	});
	return response;
}
