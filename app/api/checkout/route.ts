import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { subscriptions } from "@/drizzle/schema";
import { getAuthPlayer } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { checkoutBodySchema } from "@/lib/schemas";
import { PLANS, type PlanType, stripe } from "@/lib/stripe";
import { isPremium } from "@/lib/subscription";

export async function POST(req: NextRequest) {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { success } = rateLimit(`checkout:${player.id}`, {
		maxRequests: 5,
		windowMs: 60_000,
	});
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const body = await req.json();
	const parsed = checkoutBodySchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const plan: PlanType = parsed.data.plan;
	const priceId = PLANS[plan].priceId;
	if (!priceId) {
		return NextResponse.json(
			{ error: "Stripe price not configured" },
			{ status: 503 },
		);
	}

	const [existingSub] = await db
		.select()
		.from(subscriptions)
		.where(eq(subscriptions.playerId, player.id))
		.limit(1);

	if (
		existingSub &&
		isPremium({
			plan: existingSub.plan ?? "free",
			status: existingSub.status ?? "active",
		})
	) {
		return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
	}

	let stripeCustomerId: string;

	if (existingSub?.stripeCustomerId) {
		stripeCustomerId = existingSub.stripeCustomerId;
	} else {
		const existing = await stripe.customers.list({
			email: player.email,
			limit: 1,
		});
		if (existing.data.length > 0) {
			stripeCustomerId = existing.data[0].id;
		} else {
			const customer = await stripe.customers.create({
				email: player.email,
				metadata: { playerId: String(player.id) },
			});
			stripeCustomerId = customer.id;
		}
	}

	const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:7743";

	const session = await stripe.checkout.sessions.create({
		cancel_url: `${baseUrl}/profile?payment=canceled`,
		customer: stripeCustomerId,
		line_items: [{ price: priceId, quantity: 1 }],
		metadata: { plan, playerId: String(player.id) },
		mode: "subscription",
		subscription_data: {
			metadata: { plan, playerId: String(player.id) },
			trial_period_days: 7,
		},
		success_url: `${baseUrl}/audience?payment=success`,
	});

	return NextResponse.json({ url: session.url });
}
