import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/drizzle/db";
import { stripeEvents, subscriptions } from "@/drizzle/schema";
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

	if (!HANDLED_EVENTS.has(event.type)) {
		return NextResponse.json({ received: true });
	}

	// Idempotency check
	const [alreadyProcessed] = await db
		.select({ id: stripeEvents.id })
		.from(stripeEvents)
		.where(eq(stripeEvents.eventId, event.id))
		.limit(1);

	if (alreadyProcessed) {
		return NextResponse.json({ duplicate: true, received: true });
	}

	try {
		await withSpan(
			"stripe.webhook.process",
			{ "stripe.event_id": event.id, "stripe.event_type": event.type },
			async () => {
				switch (event.type) {
					case "checkout.session.completed": {
						const session = event.data.object as Stripe.Checkout.Session;
						const playerId = session.metadata?.playerId;
						const plan = session.metadata?.plan || "monthly";

						if (!playerId || !session.customer || !session.subscription) {
							console.warn(
								"[Stripe webhook] checkout.session.completed missing required data",
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

						const stripeSub =
							await stripe.subscriptions.retrieve(subscriptionId);
						const item = stripeSub.items.data[0];
						if (!item) break;

						const subData = {
							cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
							currentPeriodEnd: new Date(item.current_period_end * 1000),
							currentPeriodStart: new Date(item.current_period_start * 1000),
							plan: plan as "monthly" | "yearly",
							status:
								stripeSub.status === "trialing"
									? ("trialing" as const)
									: ("active" as const),
							stripeCustomerId: customerId,
							stripeSubscriptionId: subscriptionId,
							trialEnd: stripeSub.trial_end
								? new Date(stripeSub.trial_end * 1000)
								: null,
							updatedAt: new Date(),
						};

						const [existing] = await db
							.select({ id: subscriptions.id })
							.from(subscriptions)
							.where(eq(subscriptions.playerId, Number(playerId)))
							.limit(1);

						if (existing) {
							await db
								.update(subscriptions)
								.set(subData)
								.where(eq(subscriptions.id, existing.id));
						} else {
							await db.insert(subscriptions).values({
								...subData,
								playerId: Number(playerId),
							});
						}
						break;
					}

					case "invoice.paid": {
						const invoice = event.data.object as Stripe.Invoice;
						const subRef = invoice.parent?.subscription_details?.subscription;
						const subscriptionId =
							typeof subRef === "string" ? subRef : subRef?.id;
						if (!subscriptionId) break;

						const stripeSub =
							await stripe.subscriptions.retrieve(subscriptionId);
						const paidItem = stripeSub.items.data[0];
						if (!paidItem) break;

						const [sub] = await db
							.select({ id: subscriptions.id })
							.from(subscriptions)
							.where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
							.limit(1);

						if (sub) {
							await db
								.update(subscriptions)
								.set({
									currentPeriodEnd: new Date(
										paidItem.current_period_end * 1000,
									),
									currentPeriodStart: new Date(
										paidItem.current_period_start * 1000,
									),
									status: "active",
									updatedAt: new Date(),
								})
								.where(eq(subscriptions.id, sub.id));
						}
						break;
					}

					case "invoice.payment_failed": {
						const invoice = event.data.object as Stripe.Invoice;
						const failedSubRef =
							invoice.parent?.subscription_details?.subscription;
						const subscriptionId =
							typeof failedSubRef === "string"
								? failedSubRef
								: failedSubRef?.id;
						if (!subscriptionId) break;

						const [sub] = await db
							.select({ id: subscriptions.id })
							.from(subscriptions)
							.where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
							.limit(1);

						if (sub) {
							await db
								.update(subscriptions)
								.set({ status: "past_due", updatedAt: new Date() })
								.where(eq(subscriptions.id, sub.id));
						}
						break;
					}

					case "customer.subscription.updated": {
						const stripeSub = event.data.object as Stripe.Subscription;
						const updatedItem = stripeSub.items.data[0];
						if (!updatedItem) break;

						const [sub] = await db
							.select({ id: subscriptions.id })
							.from(subscriptions)
							.where(eq(subscriptions.stripeSubscriptionId, stripeSub.id))
							.limit(1);

						if (sub) {
							const mappedStatus = STATUS_MAP[stripeSub.status] ?? "past_due";
							await db
								.update(subscriptions)
								.set({
									cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
									currentPeriodEnd: new Date(
										updatedItem.current_period_end * 1000,
									),
									currentPeriodStart: new Date(
										updatedItem.current_period_start * 1000,
									),
									status: mappedStatus,
									updatedAt: new Date(),
								})
								.where(eq(subscriptions.id, sub.id));
						}
						break;
					}

					case "customer.subscription.deleted": {
						const stripeSub = event.data.object as Stripe.Subscription;

						const [sub] = await db
							.select({ id: subscriptions.id })
							.from(subscriptions)
							.where(eq(subscriptions.stripeSubscriptionId, stripeSub.id))
							.limit(1);

						if (sub) {
							await db
								.update(subscriptions)
								.set({ plan: "free", status: "expired", updatedAt: new Date() })
								.where(eq(subscriptions.id, sub.id));
						}
						break;
					}
				}
			},
		);
	} catch (error) {
		recordError(error);
		console.error(
			`[Stripe webhook] Error processing ${event.type} (${event.id}):`,
			error,
		);
		return NextResponse.json(
			{ error: "Webhook processing failed" },
			{ status: 500 },
		);
	}

	await db
		.insert(stripeEvents)
		.values({ eventId: event.id, eventType: event.type });

	return NextResponse.json({ received: true });
}
