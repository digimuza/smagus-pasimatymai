import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

export async function GET(req: NextRequest) {
	const audience = req.nextUrl.searchParams.get("audience") || "romantic";
	const today = new Date().toISOString().slice(0, 10);
	const payload = await getPayload({ config });

	// Try to find today's daily question for this audience
	const existing = await payload.find({
		collection: "daily-questions",
		depth: 1,
		limit: 1,
		where: {
			and: [{ date: { equals: today } }, { audience: { equals: audience } }],
		},
	});

	if (existing.docs.length > 0) {
		const doc = existing.docs[0];
		const q = doc.question as { id: number; question: string } | number;
		if (typeof q === "object" && q !== null) {
			return NextResponse.json({
				date: doc.date,
				id: q.id,
				question: q.question,
			});
		}
	}

	// Auto-generate: pick a random question for this audience
	const questions = await payload.find({
		collection: "questions",
		depth: 0,
		limit: 500,
		where: {
			and: [
				{ audience: { equals: audience } },
				{ status: { equals: "published" } },
			],
		},
	});

	if (questions.docs.length === 0) {
		return NextResponse.json(
			{ error: "No questions available" },
			{ status: 404 },
		);
	}

	// Use date as seed for deterministic daily pick
	const seed = today.split("-").reduce((acc, n) => acc + parseInt(n, 10), 0);
	const index = seed % questions.docs.length;
	const picked = questions.docs[index];

	// Save for today
	try {
		await payload.create({
			collection: "daily-questions",
			data: {
				audience,
				date: today,
				question: picked.id,
			},
		});
	} catch {
		// Might already exist from concurrent request
	}

	return NextResponse.json({
		date: today,
		id: picked.id,
		question: picked.question,
	});
}
