import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { PLANS, type PlanType, stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
	const payload = await getPayload({ config });

	const { user } = await payload.auth({ headers: req.headers });
	if (!user || user.collection !== "players") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const plan = body.plan as PlanType;

	if (!plan || !PLANS[plan]) {
		return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
	}

	const priceId = PLANS[plan].priceId;
	if (!priceId) {
		return NextResponse.json(
			{ error: "Stripe price not configured" },
			{ status: 503 },
		);
	}

	// Find or create Stripe customer
	let stripeCustomerId: string;

	const existingSub = await payload.find({
		collection: "subscriptions",
		limit: 1,
		where: { player: { equals: user.id } },
	});

	if (existingSub.docs.length > 0 && existingSub.docs[0].stripeCustomerId) {
		stripeCustomerId = existingSub.docs[0].stripeCustomerId;
	} else {
		const customer = await stripe.customers.create({
			email: user.email,
			metadata: { playerId: String(user.id) },
		});
		stripeCustomerId = customer.id;
	}

	const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

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
