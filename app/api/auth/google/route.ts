import { NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI =
	process.env.GOOGLE_REDIRECT_URI ||
	`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/auth/google/callback`;

export async function GET() {
	if (!GOOGLE_CLIENT_ID) {
		return NextResponse.json(
			{ error: "Google OAuth not configured" },
			{ status: 503 },
		);
	}

	const params = new URLSearchParams({
		access_type: "offline",
		client_id: GOOGLE_CLIENT_ID,
		prompt: "consent",
		redirect_uri: GOOGLE_REDIRECT_URI,
		response_type: "code",
		scope: "openid email profile",
	});

	return NextResponse.redirect(
		`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
	);
}
