import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

export async function POST(req: NextRequest) {
	const payload = await getPayload({ config });

	const { user } = await payload.auth({ headers: req.headers });
	if (!user || user.collection !== "players") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const { text, audience } = body;

	if (!text || typeof text !== "string" || text.trim().length < 10) {
		return NextResponse.json({ error: "Question too short" }, { status: 400 });
	}

	if (text.length > 300) {
		return NextResponse.json({ error: "Question too long" }, { status: 400 });
	}

	const validAudiences = ["romantic", "family", "kids", "friends"];
	if (!validAudiences.includes(audience)) {
		return NextResponse.json({ error: "Invalid audience" }, { status: 400 });
	}

	const submission = await payload.create({
		collection: "question-submissions",
		data: {
			audience,
			status: "pending",
			submittedBy: user.id,
			text: text.trim(),
		},
	});

	return NextResponse.json({ id: submission.id, status: "pending" });
}
