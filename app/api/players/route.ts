import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { players } from "@/drizzle/schema";
import { COOKIE_NAME, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { email, password, name, provider = "email" } = body;

	if (!email || !password) {
		return NextResponse.json(
			{ error: "email and password required" },
			{ status: 400 },
		);
	}

	const existing = await db
		.select({ id: players.id })
		.from(players)
		.where(eq(players.email, email))
		.limit(1);

	if (existing.length > 0) {
		return NextResponse.json(
			{ error: "Email already registered" },
			{ status: 400 },
		);
	}

	const passwordHash = await bcrypt.hash(password, 10);

	const [player] = await db
		.insert(players)
		.values({
			email,
			name: name ?? null,
			passwordHash,
			provider: provider as "email" | "google" | "apple",
		})
		.returning();

	const token = await signToken(player.id, player.email);
	const response = NextResponse.json(
		{ email: player.email, id: player.id },
		{ status: 201 },
	);
	response.cookies.set(COOKIE_NAME, token, {
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 30,
		path: "/",
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	});
	return response;
}
