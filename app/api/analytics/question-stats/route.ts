import { eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { players } from "@/drizzle/schema";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getAdminEmails(): string[] {
	return (process.env.ADMIN_EMAILS ?? "")
		.split(",")
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
}

async function isAdminRequest(req: NextRequest): Promise<boolean> {
	const token = req.cookies.get("auth-token")?.value;
	if (!token) return false;
	try {
		const { id } = await verifyToken(token);
		const [player] = await db
			.select({ email: players.email })
			.from(players)
			.where(eq(players.id, id))
			.limit(1);
		if (!player) return false;
		const adminEmails = getAdminEmails();
		return adminEmails.includes(player.email.toLowerCase());
	} catch {
		return false;
	}
}

interface QuestionStatRow {
	answers: unknown;
	id: unknown;
	question: unknown;
	skips: unknown;
	superlikes: unknown;
	views: unknown;
}

export async function GET(req: NextRequest) {
	if (!(await isAdminRequest(req))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const range = req.nextUrl.searchParams.get("range") ?? "all";

	let since: Date | null = null;
	const now = new Date();
	if (range === "7d") {
		since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	} else if (range === "30d") {
		since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
	}

	const dateFilter = since ? sql`AND e.timestamp >= ${since}` : sql``;

	const rows = await db.execute(sql`
		SELECT
			q.id,
			q.question,
			COUNT(CASE WHEN e.event_type = 'viewed'    THEN 1 END)::int AS views,
			COUNT(CASE WHEN e.event_type = 'skipped'   THEN 1 END)::int AS skips,
			COUNT(CASE WHEN e.event_type = 'answered'  THEN 1 END)::int AS answers,
			COUNT(CASE WHEN e.event_type = 'superliked' THEN 1 END)::int AS superlikes
		FROM questions q
		INNER JOIN question_events e ON e.question_id = q.id ${dateFilter}
		WHERE q.status = 'published'
		GROUP BY q.id, q.question
		ORDER BY views DESC
	`);

	const data = (rows as unknown as QuestionStatRow[]).map((r) => {
		const views = Number(r.views) || 0;
		const skips = Number(r.skips) || 0;
		const answers = Number(r.answers) || 0;
		const superlikes = Number(r.superlikes) || 0;
		return {
			answerRate: views > 0 ? Math.round((answers / views) * 100) : 0,
			answers,
			id: Number(r.id),
			question: String(r.question),
			skipRate: views > 0 ? Math.round((skips / views) * 100) : 0,
			skips,
			superlikes,
			views,
		};
	});

	return NextResponse.json({ data });
}
