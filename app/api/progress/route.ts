import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { rateLimit } from "@/lib/rateLimit";
import { progressBodySchema } from "@/lib/schemas";

// GET /api/progress — return all progress for authenticated player
export async function GET(req: NextRequest) {
	const payload = await getPayload({ config });

	// Get player from Payload auth
	const { user } = await payload.auth({ headers: req.headers });
	if (!user || user.collection !== "players") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const audience = req.nextUrl.searchParams.get("audience");

	const progress = await payload.find({
		collection: "player-progress",
		limit: 10000,
		sort: "-viewedAt",
		where: audience
			? {
					and: [
						{ player: { equals: user.id } },
						{ audience: { equals: audience } },
					],
				}
			: { player: { equals: user.id } },
	});

	return NextResponse.json({
		docs: progress.docs.map((doc) => ({
			audience: doc.audience,
			questionId: doc.questionId,
			status: doc.status,
			viewedAt: doc.viewedAt,
		})),
	});
}

// POST /api/progress — batch upsert progress records
export async function POST(req: NextRequest) {
	const payload = await getPayload({ config });

	const { user } = await payload.auth({ headers: req.headers });
	if (!user || user.collection !== "players") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { success } = rateLimit(`progress:${user.id}`, {
		windowMs: 60_000,
		maxRequests: 20,
	});
	if (!success) {
		return NextResponse.json(
			{ error: "Too many requests" },
			{ status: 429 },
		);
	}

	const body = await req.json();
	const parsed = progressBodySchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { items } = parsed.data;
	let created = 0;
	let updated = 0;

	for (const item of items) {
		// Check if record exists
		const existing = await payload.find({
			collection: "player-progress",
			limit: 1,
			where: {
				audience: { equals: item.audience },
				player: { equals: user.id },
				questionId: { equals: item.questionId },
			},
		});

		if (existing.docs.length > 0) {
			await payload.update({
				collection: "player-progress",
				data: {
					status: item.status,
					viewedAt: item.viewedAt || new Date().toISOString(),
				},
				id: existing.docs[0].id,
			});
			updated++;
		} else {
			await payload.create({
				collection: "player-progress",
				data: {
					audience: item.audience,
					player: user.id,
					questionId: item.questionId,
					status: item.status,
					viewedAt: item.viewedAt || new Date().toISOString(),
				},
			});
			created++;
		}
	}

	return NextResponse.json({ created, updated });
}

// DELETE /api/progress — delete all progress for authenticated player
export async function DELETE(req: NextRequest) {
	const payload = await getPayload({ config });

	const { user } = await payload.auth({ headers: req.headers });
	if (!user || user.collection !== "players") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	await payload.delete({
		collection: "player-progress",
		where: { player: { equals: user.id } },
	});

	return NextResponse.json({ success: true });
}
