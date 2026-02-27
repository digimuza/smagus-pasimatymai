import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: req.headers });
  if (!user || user.collection !== 'players') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sub = await payload.find({
    collection: 'subscriptions',
    where: { player: { equals: user.id } },
    limit: 1,
  });

  if (sub.docs.length === 0 || !sub.docs[0].stripeCustomerId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.docs[0].stripeCustomerId,
    return_url: `${baseUrl}/profile`,
  });

  return NextResponse.json({ url: session.url });
}
