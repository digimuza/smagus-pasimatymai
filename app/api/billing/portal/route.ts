import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { subscriptions } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { success } = await rateLimit(`billing:${player.id}`, {
		maxRequests: 5,
		windowMs: 60_000,
	});
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const [sub] = await db
		.select({ stripeCustomerId: subscriptions.stripeCustomerId })
		.from(subscriptions)
		.where(eq(subscriptions.playerId, player.id))
		.limit(1);

	if (!sub?.stripeCustomerId) {
		return NextResponse.json(
			{ error: "No subscription found" },
			{ status: 404 },
		);
	}

	const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:7743";

	const session = await stripe.billingPortal.sessions.create({
		customer: sub.stripeCustomerId,
		return_url: `${baseUrl}/profile`,
	});

	return NextResponse.json({ url: session.url });
}
