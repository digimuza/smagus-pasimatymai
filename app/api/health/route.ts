import config from "@payload-config";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

export const dynamic = "force-dynamic";

export async function GET() {
	const checks: Record<string, { status: string; latencyMs?: number }> = {};
	let healthy = true;

	// Database check via Payload
	const dbStart = Date.now();
	try {
		const payload = await getPayload({ config });
		await payload.find({ collection: "audiences", limit: 1 });
		checks.database = { status: "ok", latencyMs: Date.now() - dbStart };
	} catch {
		checks.database = { status: "error", latencyMs: Date.now() - dbStart };
		healthy = false;
	}

	// Stripe API check
	const stripeStart = Date.now();
	try {
		const { stripe } = await import("@/lib/stripe");
		await stripe.balance.retrieve();
		checks.stripe = { status: "ok", latencyMs: Date.now() - stripeStart };
	} catch {
		checks.stripe = {
			status: "error",
			latencyMs: Date.now() - stripeStart,
		};
		// Stripe down doesn't make the app unhealthy — game still works
	}

	return NextResponse.json(
		{
			checks,
			status: healthy ? "healthy" : "degraded",
			timestamp: new Date().toISOString(),
			version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
		},
		{ status: healthy ? 200 : 503 },
	);
}
