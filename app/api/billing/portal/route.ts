import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { rateLimit } from "@/lib/rateLimit";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
	const payload = await getPayload({ config });

	const { user } = await payload.auth({ headers: req.headers });
	if (!user || user.collection !== "players") {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { success } = rateLimit(`billing:${user.id}`, {
		windowMs: 60_000,
		maxRequests: 5,
	});
	if (!success) {
		return NextResponse.json(
			{ error: "Too many requests" },
			{ status: 429 },
		);
	}

	const sub = await payload.find({
		collection: "subscriptions",
		limit: 1,
		where: { player: { equals: user.id } },
	});

	if (sub.docs.length === 0 || !sub.docs[0].stripeCustomerId) {
		return NextResponse.json(
			{ error: "No subscription found" },
			{ status: 404 },
		);
	}

	const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:7743";

	const session = await stripe.billingPortal.sessions.create({
		customer: sub.docs[0].stripeCustomerId,
		return_url: `${baseUrl}/profile`,
	});

	return NextResponse.json({ url: session.url });
}
