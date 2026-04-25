import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { questionSubmissions } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { submitQuestionSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { success } = rateLimit(`submit:${player.id}`, {
		maxRequests: 5,
		windowMs: 300_000,
	});
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const body = await req.json();
	const parsed = submitQuestionSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { text, audience } = parsed.data;

	const [submission] = await db
		.insert(questionSubmissions)
		.values({
			audience: audience as "romantic" | "family" | "kids" | "friends",
			status: "pending",
			submittedBy: player.id,
			text,
		})
		.returning({ id: questionSubmissions.id });

	return NextResponse.json({ id: submission.id, status: "pending" });
}
