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
		checks.database = { latencyMs: Date.now() - dbStart, status: "ok" };
	} catch {
		checks.database = { latencyMs: Date.now() - dbStart, status: "error" };
		healthy = false;
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
