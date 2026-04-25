import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/drizzle/db";
import { questions } from "@/drizzle/schema";
import { requireAdminApi } from "@/lib/adminAuth";

const CreateSchema = z.object({
	question: z.string().min(1),
	categoryId: z.number().int().positive(),
	audience: z.enum(["romantic", "family", "kids", "friends"]),
	status: z.enum(["draft", "published"]).default("published"),
	locale: z.enum(["lt", "en"]).default("lt"),
});

export async function POST(req: NextRequest) {
	const authError = await requireAdminApi(req.headers);
	if (authError) return authError;

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const parsed = CreateSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
	}

	const [created] = await db.insert(questions).values(parsed.data).returning();
	return NextResponse.json(created, { status: 201 });
}
