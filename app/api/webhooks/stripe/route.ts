import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
	const body = await req.text();
	const sig = req.headers.get("stripe-signature");

	if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
		return NextResponse.json({ error: "Missing signature" }, { status: 400 });
	}

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(
			body,
			sig,
			process.env.STRIPE_WEBHOOK_SECRET,
		);
	} catch {
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	const payload = await getPayload({ config });

	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session;
			const playerId = session.metadata?.playerId;
			const plan = session.metadata?.plan || "monthly";

			if (!playerId || !session.customer || !session.subscription) break;

			const customerId =
				typeof session.customer === "string"
					? session.customer
					: session.customer.id;
			const subscriptionId =
				typeof session.subscription === "string"
					? session.subscription
					: session.subscription.id;

			// Get subscription details from Stripe
			const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

			// Find existing subscription record
			const existing = await payload.find({
				collection: "subscriptions",
				limit: 1,
				where: { player: { equals: Number(playerId) } },
			});

			// In Stripe v20+, current_period is on subscription items
			const item = stripeSub.items.data[0];

			const subData = {
				cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
				currentPeriodEnd: new Date(
					item.current_period_end * 1000,
				).toISOString(),
				currentPeriodStart: new Date(
					item.current_period_start * 1000,
				).toISOString(),
				plan: plan as "monthly" | "yearly",
				player: Number(playerId),
				status:
					stripeSub.status === "trialing"
						? ("trialing" as const)
						: ("active" as const),
				stripeCustomerId: customerId,
				stripeSubscriptionId: subscriptionId,
				trialEnd: stripeSub.trial_end
					? new Date(stripeSub.trial_end * 1000).toISOString()
					: undefined,
			};

			if (existing.docs.length > 0) {
				await payload.update({
					collection: "subscriptions",
					data: subData,
					id: existing.docs[0].id,
				});
			} else {
				await payload.create({
					collection: "subscriptions",
					data: subData,
				});
			}
			break;
		}

		case "invoice.paid": {
			const invoice = event.data.object as Stripe.Invoice;
			const subRef = invoice.parent?.subscription_details?.subscription;
			const subscriptionId = typeof subRef === "string" ? subRef : subRef?.id;
			if (!subscriptionId) break;

			const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
			const paidItem = stripeSub.items.data[0];

			const sub = await payload.find({
				collection: "subscriptions",
				limit: 1,
				where: { stripeSubscriptionId: { equals: subscriptionId } },
			});

			if (sub.docs.length > 0) {
				await payload.update({
					collection: "subscriptions",
					data: {
						currentPeriodEnd: new Date(
							paidItem.current_period_end * 1000,
						).toISOString(),
						currentPeriodStart: new Date(
							paidItem.current_period_start * 1000,
						).toISOString(),
						status: "active",
					},
					id: sub.docs[0].id,
				});
			}
			break;
		}

		case "invoice.payment_failed": {
			const invoice = event.data.object as Stripe.Invoice;
			const failedSubRef = invoice.parent?.subscription_details?.subscription;
			const subscriptionId =
				typeof failedSubRef === "string" ? failedSubRef : failedSubRef?.id;
			if (!subscriptionId) break;

			const sub = await payload.find({
				collection: "subscriptions",
				limit: 1,
				where: { stripeSubscriptionId: { equals: subscriptionId } },
			});

			if (sub.docs.length > 0) {
				await payload.update({
					collection: "subscriptions",
					data: { status: "past_due" },
					id: sub.docs[0].id,
				});
			}
			break;
		}

		case "customer.subscription.updated": {
			const stripeSub = event.data.object as Stripe.Subscription;
			const updatedItem = stripeSub.items.data[0];

			const sub = await payload.find({
				collection: "subscriptions",
				limit: 1,
				where: { stripeSubscriptionId: { equals: stripeSub.id } },
			});

			if (sub.docs.length > 0) {
				const statusMap: Record<string, string> = {
					active: "active",
					canceled: "canceled",
					incomplete: "past_due",
					incomplete_expired: "expired",
					past_due: "past_due",
					paused: "canceled",
					trialing: "trialing",
					unpaid: "past_due",
				};

				await payload.update({
					collection: "subscriptions",
					data: {
						cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
						currentPeriodEnd: new Date(
							updatedItem.current_period_end * 1000,
						).toISOString(),
						currentPeriodStart: new Date(
							updatedItem.current_period_start * 1000,
						).toISOString(),
						status: (statusMap[stripeSub.status] || "active") as
							| "active"
							| "canceled"
							| "past_due"
							| "trialing"
							| "expired",
					},
					id: sub.docs[0].id,
				});
			}
			break;
		}

		case "customer.subscription.deleted": {
			const stripeSub = event.data.object as Stripe.Subscription;

			const sub = await payload.find({
				collection: "subscriptions",
				limit: 1,
				where: { stripeSubscriptionId: { equals: stripeSub.id } },
			});

			if (sub.docs.length > 0) {
				await payload.update({
					collection: "subscriptions",
					data: { plan: "free", status: "expired" },
					id: sub.docs[0].id,
				});
			}
			break;
		}
	}

	return NextResponse.json({ received: true });
}
