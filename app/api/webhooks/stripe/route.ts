import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const payload = await getPayload({ config });

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const playerId = session.metadata?.playerId;
      const plan = session.metadata?.plan || 'monthly';

      if (!playerId || !session.customer || !session.subscription) break;

      const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

      // Get subscription details from Stripe
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

      // Find existing subscription record
      const existing = await payload.find({
        collection: 'subscriptions',
        where: { player: { equals: Number(playerId) } },
        limit: 1,
      });

      // In Stripe v20+, current_period is on subscription items
      const item = stripeSub.items.data[0];

      const subData = {
        player: Number(playerId),
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        plan: plan as 'monthly' | 'yearly',
        status: stripeSub.status === 'trialing' ? 'trialing' as const : 'active' as const,
        currentPeriodStart: new Date(item.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(item.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        trialEnd: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000).toISOString() : undefined,
      };

      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'subscriptions',
          id: existing.docs[0].id,
          data: subData,
        });
      } else {
        await payload.create({
          collection: 'subscriptions',
          data: subData,
        });
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subRef = invoice.parent?.subscription_details?.subscription;
      const subscriptionId = typeof subRef === 'string' ? subRef : subRef?.id;
      if (!subscriptionId) break;

      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
      const paidItem = stripeSub.items.data[0];

      const sub = await payload.find({
        collection: 'subscriptions',
        where: { stripeSubscriptionId: { equals: subscriptionId } },
        limit: 1,
      });

      if (sub.docs.length > 0) {
        await payload.update({
          collection: 'subscriptions',
          id: sub.docs[0].id,
          data: {
            status: 'active',
            currentPeriodStart: new Date(paidItem.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(paidItem.current_period_end * 1000).toISOString(),
          },
        });
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const failedSubRef = invoice.parent?.subscription_details?.subscription;
      const subscriptionId = typeof failedSubRef === 'string' ? failedSubRef : failedSubRef?.id;
      if (!subscriptionId) break;

      const sub = await payload.find({
        collection: 'subscriptions',
        where: { stripeSubscriptionId: { equals: subscriptionId } },
        limit: 1,
      });

      if (sub.docs.length > 0) {
        await payload.update({
          collection: 'subscriptions',
          id: sub.docs[0].id,
          data: { status: 'past_due' },
        });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const stripeSub = event.data.object as Stripe.Subscription;
      const updatedItem = stripeSub.items.data[0];

      const sub = await payload.find({
        collection: 'subscriptions',
        where: { stripeSubscriptionId: { equals: stripeSub.id } },
        limit: 1,
      });

      if (sub.docs.length > 0) {
        const statusMap: Record<string, string> = {
          active: 'active',
          past_due: 'past_due',
          canceled: 'canceled',
          trialing: 'trialing',
          unpaid: 'past_due',
          incomplete: 'past_due',
          incomplete_expired: 'expired',
          paused: 'canceled',
        };

        await payload.update({
          collection: 'subscriptions',
          id: sub.docs[0].id,
          data: {
            status: (statusMap[stripeSub.status] || 'active') as 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired',
            currentPeriodStart: new Date(updatedItem.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(updatedItem.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const stripeSub = event.data.object as Stripe.Subscription;

      const sub = await payload.find({
        collection: 'subscriptions',
        where: { stripeSubscriptionId: { equals: stripeSub.id } },
        limit: 1,
      });

      if (sub.docs.length > 0) {
        await payload.update({
          collection: 'subscriptions',
          id: sub.docs[0].id,
          data: { status: 'expired', plan: 'free' },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
