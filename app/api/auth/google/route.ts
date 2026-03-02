import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI =
	process.env.GOOGLE_REDIRECT_URI ||
	`${process.env.NEXT_PUBLIC_URL || "http://localhost:7743"}/api/auth/google/callback`;

export async function GET(request: Request) {
	const ip =
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		"unknown";
	const { success } = rateLimit(`oauth:${ip}`, {
		windowMs: 60_000,
		maxRequests: 10,
	});
	if (!success) {
		return NextResponse.json(
			{ error: "Too many requests" },
			{ status: 429 },
		);
	}

	if (!GOOGLE_CLIENT_ID) {
		return NextResponse.json(
			{ error: "Google OAuth not configured" },
			{ status: 503 },
		);
	}

	const state = crypto.randomUUID();
	const cookieStore = await cookies();
	cookieStore.set("oauth_state", state, {
		httpOnly: true,
		maxAge: 600,
		path: "/",
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	});

	const params = new URLSearchParams({
		access_type: "offline",
		client_id: GOOGLE_CLIENT_ID,
		prompt: "consent",
		redirect_uri: GOOGLE_REDIRECT_URI,
		response_type: "code",
		scope: "openid email profile",
		state,
	});

	return NextResponse.redirect(
		`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
	);
}
