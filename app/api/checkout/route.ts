import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { rateLimit } from "@/lib/rateLimit";
import { checkoutBodySchema } from "@/lib/schemas";
import { PLANS, type PlanType, stripe } from "@/lib/stripe";
import { isPremium } from "@/lib/subscription";

export async function POST(req: NextRequest) {
	const payload = await getPayload({ config });

	const { user } = await payload.auth({ headers: req.headers });
	if (!user || user.collection !== "players") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { success } = rateLimit(`checkout:${user.id}`, {
		windowMs: 60_000,
		maxRequests: 5,
	});
	if (!success) {
		return NextResponse.json(
			{ error: "Too many requests" },
			{ status: 429 },
		);
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

	// Check existing subscription
	const existingSub = await payload.find({
		collection: "subscriptions",
		limit: 1,
		overrideAccess: true,
		where: { player: { equals: user.id } },
	});

	// Block checkout if user already has an active premium subscription
	if (existingSub.docs.length > 0) {
		const sub = existingSub.docs[0];
		if (isPremium(sub)) {
			return NextResponse.json(
				{ error: "Already subscribed" },
				{ status: 409 },
			);
		}
	}

	// Find or create Stripe customer (deduplicate via local record first, then Stripe)
	let stripeCustomerId: string;

	if (existingSub.docs.length > 0 && existingSub.docs[0].stripeCustomerId) {
		stripeCustomerId = existingSub.docs[0].stripeCustomerId;
	} else {
		// Check Stripe for existing customer before creating new one
		const existingCustomers = await stripe.customers.list({
			email: user.email,
			limit: 1,
		});

		if (existingCustomers.data.length > 0) {
			stripeCustomerId = existingCustomers.data[0].id;
		} else {
			const customer = await stripe.customers.create({
				email: user.email,
				metadata: { playerId: String(user.id) },
			});
			stripeCustomerId = customer.id;
		}
	}

	const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:7743";

	const session = await stripe.checkout.sessions.create({
		cancel_url: `${baseUrl}/profile?payment=canceled`,
		customer: stripeCustomerId,
		line_items: [{ price: priceId, quantity: 1 }],
		metadata: { plan, playerId: String(user.id) },
		mode: "subscription",
		subscription_data: {
			metadata: { plan, playerId: String(user.id) },
			trial_period_days: 7,
		},
		success_url: `${baseUrl}/audience?payment=success`,
	});

	return NextResponse.json({ url: session.url });
}
