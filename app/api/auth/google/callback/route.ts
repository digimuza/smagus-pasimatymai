import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

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

function oauthPassword(providerId: string): string {
	// Deterministic password for OAuth users — not used for actual auth, just satisfies Payload's requirement
	const secret = process.env.PAYLOAD_SECRET || "fallback";
	return `oauth_${providerId}_${secret}`.slice(0, 72);
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

		const payload = await getPayload({ config });

		// Find existing player by provider ID or email
		let player = null;
		const byProvider = await payload.find({
			collection: "players",
			limit: 1,
			where: {
				provider: { equals: "google" },
				providerId: { equals: googleUser.id },
			},
		});

		if (byProvider.docs.length > 0) {
			player = byProvider.docs[0];
		} else {
			// Check if email exists
			const byEmail = await payload.find({
				collection: "players",
				limit: 1,
				where: { email: { equals: googleUser.email } },
			});

			if (byEmail.docs.length > 0) {
				// Link Google to existing account
				player = await payload.update({
					collection: "players",
					data: {
						avatar: googleUser.picture || undefined,
						name: byEmail.docs[0].name || googleUser.name,
						provider: "google",
						providerId: googleUser.id,
					},
					id: byEmail.docs[0].id,
				});
			} else {
				// Create new player — generate a random password for Payload auth
				player = await payload.create({
					collection: "players",
					data: {
						avatar: googleUser.picture,
						email: googleUser.email,
						name: googleUser.name,
						password: oauthPassword(googleUser.id),
						provider: "google",
						providerId: googleUser.id,
					},
				});
			}
		}

		// Login the player to get a Payload session token
		const loginResult = await payload.login({
			collection: "players",
			data: {
				email: player.email,
				password: oauthPassword(googleUser.id),
			},
		});

		// Build response with redirect
		const response = NextResponse.redirect(new URL("/audience", req.url));

		// Set the payload token cookie
		if (loginResult.token) {
			response.cookies.set("payload-token", loginResult.token, {
				httpOnly: true,
				maxAge: 60 * 60 * 24 * 30, // 30 days
				path: "/",
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
			});
		}

		return response;
	} catch (err) {
		console.error("Google OAuth error:", err);
		return NextResponse.redirect(new URL("/?auth=error", req.url));
	}
}
