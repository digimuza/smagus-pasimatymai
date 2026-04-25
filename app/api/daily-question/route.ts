import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { dailyQuestions, questions } from "@/drizzle/schema";

const VALID_AUDIENCES = ["romantic", "family", "kids", "friends"] as const;
type Audience = (typeof VALID_AUDIENCES)[number];

export async function GET(req: NextRequest) {
	const rawAudience = req.nextUrl.searchParams.get("audience") || "romantic";
	const audience: Audience = VALID_AUDIENCES.includes(rawAudience as Audience)
		? (rawAudience as Audience)
		: "romantic";
	const today = new Date().toISOString().slice(0, 10);

	// Try to find today's daily question
	const [existing] = await db
		.select({
			date: dailyQuestions.date,
			questionId: dailyQuestions.questionId,
		})
		.from(dailyQuestions)
		.where(
			and(
				eq(dailyQuestions.date, today),
				eq(dailyQuestions.audience, audience),
			),
		)
		.limit(1);

	if (existing) {
		const [q] = await db
			.select({ id: questions.id, question: questions.question })
			.from(questions)
			.where(eq(questions.id, existing.questionId))
			.limit(1);

		if (q) {
			return NextResponse.json({ date: today, id: q.id, question: q.question });
		}
	}

	// Auto-generate: pick a deterministic random question
	const allQuestions = await db
		.select({ id: questions.id, question: questions.question })
		.from(questions)
		.where(
			and(eq(questions.audience, audience), eq(questions.status, "published")),
		)
		.limit(500);

	if (allQuestions.length === 0) {
		return NextResponse.json(
			{ error: "No questions available" },
			{ status: 404 },
		);
	}

	const seed = today.split("-").reduce((acc, n) => acc + parseInt(n, 10), 0);
	const picked = allQuestions[seed % allQuestions.length];

	try {
		await db.insert(dailyQuestions).values({
			audience,
			date: today,
			questionId: picked.id,
		});
	} catch {
		// Unique constraint — concurrent request already inserted
	}

	return NextResponse.json({
		date: today,
		id: picked.id,
		question: picked.question,
	});
}
