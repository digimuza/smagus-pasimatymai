import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";

export const dynamic = "force-dynamic";

export async function GET() {
	const checks: Record<string, { status: string; latencyMs?: number }> = {};
	let healthy = true;

	const dbStart = Date.now();
	try {
		await db.execute(sql`SELECT 1`);
		checks.database = { latencyMs: Date.now() - dbStart, status: "ok" };
	} catch {
		checks.database = { latencyMs: Date.now() - dbStart, status: "error" };
		healthy = false;
	}

	const stripeStart = Date.now();
	try {
		const { stripe } = await import("@/lib/stripe");
		await stripe.balance.retrieve();
		checks.stripe = { latencyMs: Date.now() - stripeStart, status: "ok" };
	} catch {
		checks.stripe = { latencyMs: Date.now() - stripeStart, status: "error" };
	}

	return NextResponse.json(
		{
			checks,
			status: healthy ? "healthy" : "degraded",
			timestamp: new Date().toISOString(),
			version: process.env.COMMIT_SHA?.slice(0, 7) || "dev",
		},
		{ status: healthy ? 200 : 503 },
	);
}
