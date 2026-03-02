import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { recordError, withSpan } from "@/lib/telemetry";

const HANDLED_EVENTS = new Set([
	"checkout.session.completed",
	"invoice.paid",
	"invoice.payment_failed",
	"customer.subscription.updated",
	"customer.subscription.deleted",
]);

const STATUS_MAP: Record<
	string,
	"active" | "canceled" | "past_due" | "trialing" | "expired"
> = {
	active: "active",
	canceled: "canceled",
	incomplete: "past_due",
	incomplete_expired: "expired",
	past_due: "past_due",
	paused: "canceled",
	trialing: "trialing",
	unpaid: "past_due",
};

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

	// Early return for unhandled event types
	if (!HANDLED_EVENTS.has(event.type)) {
		return NextResponse.json({ received: true });
	}

	const payload = await getPayload({ config });

	// Idempotency: skip already-processed events
	const alreadyProcessed = await payload.find({
		collection: "stripe-events",
		limit: 1,
		overrideAccess: true,
		where: { eventId: { equals: event.id } },
	});
	if (alreadyProcessed.docs.length > 0) {
		return NextResponse.json({ duplicate: true, received: true });
	}

	try {
		await withSpan(
			"stripe.webhook.process",
			{ "stripe.event_type": event.type, "stripe.event_id": event.id },
			async () => {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				const playerId = session.metadata?.playerId;
				const plan = session.metadata?.plan || "monthly";

				if (!playerId || !session.customer || !session.subscription) {
					console.warn(
						"[Stripe webhook] checkout.session.completed missing required data",
						{
							customer: !!session.customer,
							playerId,
							subscription: !!session.subscription,
						},
					);
					break;
				}

				const customerId =
					typeof session.customer === "string"
						? session.customer
						: session.customer.id;
				const subscriptionId =
					typeof session.subscription === "string"
						? session.subscription
						: session.subscription.id;

				const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
				const item = stripeSub.items.data[0];

				if (!item) {
					console.error(
						`[Stripe webhook] No items on subscription ${subscriptionId}`,
					);
					break;
				}

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

				const existing = await payload.find({
					collection: "subscriptions",
					limit: 1,
					overrideAccess: true,
					where: { player: { equals: Number(playerId) } },
				});

				if (existing.docs.length > 0) {
					await payload.update({
						collection: "subscriptions",
						data: subData,
						id: existing.docs[0].id,
						overrideAccess: true,
					});
				} else {
					await payload.create({
						collection: "subscriptions",
						data: subData,
						overrideAccess: true,
					});
				}
				break;
			}

			case "invoice.paid": {
				const invoice = event.data.object as Stripe.Invoice;
				const subRef = invoice.parent?.subscription_details?.subscription;
				const subscriptionId = typeof subRef === "string" ? subRef : subRef?.id;

				if (!subscriptionId) {
					console.warn("[Stripe webhook] invoice.paid missing subscription ID");
					break;
				}

				const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
				const paidItem = stripeSub.items.data[0];

				if (!paidItem) {
					console.error(
						`[Stripe webhook] No items on subscription ${subscriptionId}`,
					);
					break;
				}

				const sub = await payload.find({
					collection: "subscriptions",
					limit: 1,
					overrideAccess: true,
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
						overrideAccess: true,
					});
				} else {
					console.warn(
						`[Stripe webhook] invoice.paid: no local subscription for ${subscriptionId}`,
					);
				}
				break;
			}

			case "invoice.payment_failed": {
				const invoice = event.data.object as Stripe.Invoice;
				const failedSubRef = invoice.parent?.subscription_details?.subscription;
				const subscriptionId =
					typeof failedSubRef === "string" ? failedSubRef : failedSubRef?.id;

				if (!subscriptionId) {
					console.warn(
						"[Stripe webhook] invoice.payment_failed missing subscription ID",
					);
					break;
				}

				const sub = await payload.find({
					collection: "subscriptions",
					limit: 1,
					overrideAccess: true,
					where: { stripeSubscriptionId: { equals: subscriptionId } },
				});

				if (sub.docs.length > 0) {
					await payload.update({
						collection: "subscriptions",
						data: { status: "past_due" },
						id: sub.docs[0].id,
						overrideAccess: true,
					});
				} else {
					console.warn(
						`[Stripe webhook] invoice.payment_failed: no local subscription for ${subscriptionId}`,
					);
				}
				break;
			}

			case "customer.subscription.updated": {
				const stripeSub = event.data.object as Stripe.Subscription;
				const updatedItem = stripeSub.items.data[0];

				if (!updatedItem) {
					console.error(
						`[Stripe webhook] No items on subscription ${stripeSub.id}`,
					);
					break;
				}

				const sub = await payload.find({
					collection: "subscriptions",
					limit: 1,
					overrideAccess: true,
					where: {
						stripeSubscriptionId: { equals: stripeSub.id },
					},
				});

				if (sub.docs.length > 0) {
					const mappedStatus = STATUS_MAP[stripeSub.status];
					if (!mappedStatus) {
						console.warn(
							`[Stripe webhook] Unknown subscription status: ${stripeSub.status}`,
						);
					}

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
							status: mappedStatus || "past_due",
						},
						id: sub.docs[0].id,
						overrideAccess: true,
					});
				} else {
					console.warn(
						`[Stripe webhook] subscription.updated: no local subscription for ${stripeSub.id}`,
					);
				}
				break;
			}

			case "customer.subscription.deleted": {
				const stripeSub = event.data.object as Stripe.Subscription;

				const sub = await payload.find({
					collection: "subscriptions",
					limit: 1,
					overrideAccess: true,
					where: {
						stripeSubscriptionId: { equals: stripeSub.id },
					},
				});

				if (sub.docs.length > 0) {
					await payload.update({
						collection: "subscriptions",
						data: { plan: "free", status: "expired" },
						id: sub.docs[0].id,
						overrideAccess: true,
					});
				} else {
					console.warn(
						`[Stripe webhook] subscription.deleted: no local subscription for ${stripeSub.id}`,
					);
				}
				break;
			}
			default:
				break;
		}
		});
	} catch (error) {
		recordError(error);
		console.error(
			`[Stripe webhook] Error processing ${event.type} (${event.id}):`,
			error,
		);
		// Return 500 so Stripe retries — don't record as processed
		return NextResponse.json(
			{ error: "Webhook processing failed" },
			{ status: 500 },
		);
	}

	// Record successfully processed event for idempotency
	await payload.create({
		collection: "stripe-events",
		data: { eventId: event.id, eventType: event.type },
		overrideAccess: true,
	});

	return NextResponse.json({ received: true });
}
