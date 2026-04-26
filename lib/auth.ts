import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { db } from "@/drizzle/db";
import { players } from "@/drizzle/schema";

export const COOKIE_NAME = "auth-token";

function getSecret() {
	return new TextEncoder().encode(
		process.env.PAYLOAD_SECRET || "dev-fallback-secret-min-32-chars!!",
	);
}

export async function signToken(
	playerId: number,
	email: string,
): Promise<string> {
	return new SignJWT({ email, sub: String(playerId) })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("30d")
		.setIssuedAt()
		.sign(getSecret());
}

export async function verifyToken(
	token: string,
): Promise<{ id: number; email: string }> {
	const { payload } = await jwtVerify(token, getSecret());
	return { email: payload.email as string, id: Number(payload.sub) };
}

function parseCookieToken(cookieStr: string): string | null {
	for (const part of cookieStr.split(";")) {
		const trimmed = part.trim();
		const eqIdx = trimmed.indexOf("=");
		if (eqIdx === -1) continue;
		const key = trimmed.slice(0, eqIdx).trim();
		if (key === COOKIE_NAME)
			return decodeURIComponent(trimmed.slice(eqIdx + 1));
	}
	return null;
}

export async function getAuthPlayer(headers: Headers) {
	const cookieHeader = headers.get("cookie") ?? "";
	const token = parseCookieToken(cookieHeader);
	if (!token) return null;
	try {
		const { id } = await verifyToken(token);
		const [player] = await db
			.select()
			.from(players)
			.where(eq(players.id, id))
			.limit(1);
		return player ?? null;
	} catch {
		return null;
	}
}
