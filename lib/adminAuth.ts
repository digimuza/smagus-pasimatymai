import { NextResponse } from "next/server";
import { getAuthPlayer } from "@/lib/auth";

function getAdminEmails(): string[] {
	return (process.env.ADMIN_EMAILS ?? "")
		.split(",")
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
}

/** Returns a 401/403 NextResponse when the caller is not an admin, or null when they are. */
export async function requireAdminApi(
	headers: Headers,
): Promise<NextResponse | null> {
	const player = await getAuthPlayer(headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const adminEmails = getAdminEmails();
	if (!adminEmails.includes(player.email.toLowerCase())) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}
	return null;
}
