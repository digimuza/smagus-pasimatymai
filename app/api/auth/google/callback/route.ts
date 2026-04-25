import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { players } from "@/drizzle/schema";
import { COOKIE_NAME, signToken } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
	process.env.GOOGLE_REDIRECT_URI ||
	`${process.env.NEXT_PUBLIC_URL || "http://localhost:7743"}/api/auth/google/callback`;

async function exchangeCodeForTokens(code: string) {
	const res = await fetch("https://oauth2.googleapis.com/token", {
		body: new URLSearchParams({
			client_id: GOOGLE_CLIENT_ID || "",
			client_secret: GOOGLE_CLIENT_SECRET || "",
			code,
			grant_type: "authorization_code",
			redirect_uri: GOOGLE_REDIRECT_URI,
		}),
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		method: "POST",
	});
	return res.json();
}

async function getGoogleUserInfo(accessToken: string) {
	const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	return res.json();
}

export async function GET(req: NextRequest) {
	const code = req.nextUrl.searchParams.get("code");
	const error = req.nextUrl.searchParams.get("error");

	const state = req.nextUrl.searchParams.get("state");
	const storedState = req.cookies.get("oauth_state")?.value;

	if (!state || !storedState || state !== storedState) {
		return NextResponse.redirect(new URL("/?auth=error", req.url));
	}

	if (error || !code) {
		return NextResponse.redirect(new URL("/?auth=error", req.url));
	}

	if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
		return NextResponse.redirect(new URL("/?auth=error", req.url));
	}

	try {
		const tokens = await exchangeCodeForTokens(code);
		if (!tokens.access_token) {
			return NextResponse.redirect(new URL("/?auth=error", req.url));
		}

		const googleUser = await getGoogleUserInfo(tokens.access_token);
		if (!googleUser.email) {
			return NextResponse.redirect(new URL("/?auth=error", req.url));
		}

		// Find by provider ID first
		const [byProvider] = await db
			.select()
			.from(players)
			.where(
				and(
					eq(players.provider, "google"),
					eq(players.providerId, String(googleUser.id)),
				),
			)
			.limit(1);

		let player = byProvider;

		if (!player) {
			const [byEmail] = await db
				.select()
				.from(players)
				.where(eq(players.email, googleUser.email))
				.limit(1);

			if (byEmail) {
				// Link Google to existing account
				const [updated] = await db
					.update(players)
					.set({
						avatar: googleUser.picture ?? byEmail.avatar,
						name: byEmail.name ?? googleUser.name,
						provider: "google",
						providerId: String(googleUser.id),
						updatedAt: new Date(),
					})
					.where(eq(players.id, byEmail.id))
					.returning();
				player = updated;
			} else {
				// Create new player
				const [created] = await db
					.insert(players)
					.values({
						avatar: googleUser.picture,
						email: googleUser.email,
						name: googleUser.name,
						provider: "google",
						providerId: String(googleUser.id),
					})
					.returning();
				player = created;
			}
		}

		const token = await signToken(player.id, player.email);
		const response = NextResponse.redirect(new URL("/audience", req.url));

		response.cookies.delete("oauth_state");
		response.cookies.set(COOKIE_NAME, token, {
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 30,
			path: "/",
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
		});

		return response;
	} catch (err) {
		const { recordError } = await import("@/lib/telemetry");
		recordError(err);
		console.error("Google OAuth error:", err);
		return NextResponse.redirect(new URL("/?auth=error", req.url));
	}
}
