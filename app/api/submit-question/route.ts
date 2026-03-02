import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { rateLimit } from "@/lib/rateLimit";
import { submitQuestionSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
	const payload = await getPayload({ config });

	const { user } = await payload.auth({ headers: req.headers });
	if (!user || user.collection !== "players") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { success } = rateLimit(`submit:${user.id}`, {
		windowMs: 300_000,
		maxRequests: 5,
	});
	if (!success) {
		return NextResponse.json(
			{ error: "Too many requests" },
			{ status: 429 },
		);
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

	const submission = await payload.create({
		collection: "question-submissions",
		data: {
			audience,
			status: "pending",
			submittedBy: user.id,
			text,
		},
	});

	return NextResponse.json({ id: submission.id, status: "pending" });
}
