import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { rateLimit } from "@/lib/rateLimit";
import { progressBodySchema } from "@/lib/schemas";

// GET /api/progress — return all progress for authenticated player
export async function GET(req: NextRequest) {
	try {
		const payload = await getPayload({ config });

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
	} catch (error) {
		console.error("Progress fetch error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// POST /api/progress — batch upsert progress records
export async function POST(req: NextRequest) {
	try {
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

		// Single query to fetch all existing progress for this player
		const existing = await payload.find({
			collection: "player-progress",
			limit: 10000,
			where: { player: { equals: user.id } },
		});

		// Build lookup map for O(1) matching: "audience|questionId" -> doc.id
		const existingMap = new Map<string, number | string>();
		for (const doc of existing.docs) {
			existingMap.set(`${doc.audience}|${doc.questionId}`, doc.id);
		}

		// Partition into creates vs updates
		const toCreate: typeof items = [];
		const toUpdate: Array<{ id: number | string; item: (typeof items)[0] }> =
			[];

		for (const item of items) {
			const existingId = existingMap.get(
				`${item.audience}|${item.questionId}`,
			);
			if (existingId !== undefined) {
				toUpdate.push({ id: existingId, item });
			} else {
				toCreate.push(item);
			}
		}

		// Execute all operations concurrently
		const ops: Promise<unknown>[] = [];
		for (const item of toCreate) {
			ops.push(
				payload.create({
					collection: "player-progress",
					data: {
						audience: item.audience,
						player: user.id,
						questionId: item.questionId,
						status: item.status,
						viewedAt: item.viewedAt || new Date().toISOString(),
					},
				}),
			);
		}
		for (const { id, item } of toUpdate) {
			ops.push(
				payload.update({
					collection: "player-progress",
					data: {
						status: item.status,
						viewedAt: item.viewedAt || new Date().toISOString(),
					},
					id,
				}),
			);
		}
		const results = await Promise.allSettled(ops);

		let created = 0;
		let updated = 0;
		for (let i = 0; i < results.length; i++) {
			if (results[i].status === "fulfilled") {
				if (i < toCreate.length) created++;
				else updated++;
			}
		}

		return NextResponse.json({ created, updated });
	} catch (error) {
		console.error("Progress sync error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// DELETE /api/progress — delete all progress for authenticated player
export async function DELETE(req: NextRequest) {
	try {
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
	} catch (error) {
		console.error("Progress delete error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
