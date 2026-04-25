import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { questions } from "@/drizzle/schema";
import { requireAdminApi } from "@/lib/adminAuth";

const UpdateSchema = z.object({
	question: z.string().min(1).optional(),
	categoryId: z.number().int().positive().optional(),
	audience: z.enum(["romantic", "family", "kids", "friends"]).optional(),
	status: z.enum(["draft", "published"]).optional(),
	locale: z.enum(["lt", "en"]).optional(),
});

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const authError = await requireAdminApi(req.headers);
	if (authError) return authError;

	const { id } = await params;
	const questionId = Number(id);
	if (!Number.isFinite(questionId) || questionId <= 0) {
		return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
	}

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const parsed = UpdateSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
	}

	const [updated] = await db
		.update(questions)
		.set({ ...parsed.data, updatedAt: new Date() })
		.where(eq(questions.id, questionId))
		.returning();

	if (!updated) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}
	return NextResponse.json(updated);
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const authError = await requireAdminApi(req.headers);
	if (authError) return authError;

	const { id } = await params;
	const questionId = Number(id);
	if (!Number.isFinite(questionId) || questionId <= 0) {
		return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
	}

	const [deleted] = await db
		.delete(questions)
		.where(eq(questions.id, questionId))
		.returning({ id: questions.id });

	if (!deleted) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}
	return NextResponse.json({ ok: true });
}
