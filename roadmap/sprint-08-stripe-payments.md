# Sprint 8: Stripe Payments

**Status:** Not Started
**Depends on:** Sprint 7
**Blocks:** Sprint 9

## Goal

Monetize the app with a freemium model using Stripe subscriptions. Free users get access to a limited question set and one audience. Premium users unlock all questions, all audiences, spicy cards, and advanced features. Handle payments, webhooks, and subscription lifecycle.

## Tasks

- [ ] **[M]** Define free vs premium tiers — Document and implement tier definitions:
  - **Free:** First 50 questions per audience (romantic only), no spicy cards, basic categories, no progress sync, ads placeholder
  - **Premium (€4.99/month or €29.99/year):** All questions, all audiences, all spicy cards, all categories, progress sync, no ads, priority new content

- [ ] **[M]** Create `Subscriptions` collection — New collection in `collections/Subscriptions.ts` with fields:
  - `player` (relationship to Players, unique)
  - `stripeCustomerId` (text)
  - `stripeSubscriptionId` (text)
  - `plan` (select: `free`, `monthly`, `yearly`)
  - `status` (select: `active`, `canceled`, `past_due`, `trialing`, `expired`)
  - `currentPeriodStart` (date)
  - `currentPeriodEnd` (date)
  - `cancelAtPeriodEnd` (checkbox)
  - `trialEnd` (date)

- [ ] **[M]** Set up Stripe SDK and config — Install `stripe` package. Create `lib/stripe.ts` with Stripe client initialization. Store `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` in `.env`. Create Stripe products and prices in the Stripe dashboard.

- [ ] **[L]** Build Stripe webhook handler — Create `app/(app)/api/webhooks/stripe/route.ts` handling events:
  - `checkout.session.completed` — create/update Subscription
  - `invoice.paid` — extend subscription period
  - `invoice.payment_failed` — mark as `past_due`
  - `customer.subscription.updated` — sync status changes
  - `customer.subscription.deleted` — mark as `expired`
  - Verify webhook signature, idempotent processing.

- [ ] **[M]** Build checkout API route — Create `app/(app)/api/checkout/route.ts`:
  - Accepts `plan` (monthly/yearly) and player ID
  - Creates Stripe Checkout Session with correct price
  - Returns checkout URL
  - Sets success/cancel redirect URLs

- [ ] **[S]** Build customer portal route — Create `app/(app)/api/billing/portal/route.ts`:
  - Creates a Stripe Customer Portal session for the player
  - Returns portal URL for managing subscription, payment methods, cancellation

- [ ] **[M]** Build paywall UI — Create `components/payments/Paywall.tsx`:
  - Shown when free users try to access premium content
  - Displays tier comparison (free vs premium features)
  - Monthly and yearly pricing with "save X%" badge on yearly
  - CTA buttons that call checkout API
  - Uses design system components (Button, Card, Badge)

- [ ] **[M]** Implement content gating — Create `lib/subscription.ts` with helper functions:
  - `canAccessQuestion(player, question)` — checks if question is in free tier or player has premium
  - `canAccessAudience(player, audience)` — only romantic is free
  - `canAccessSpicyCards(player)` — premium only
  - Integrate into QuestionContext and API routes. Free-tier questions should be deterministic (always the same 50, not random).

- [ ] **[S]** Build subscription status UI — Create `components/payments/SubscriptionBadge.tsx` showing current plan status in profile and settings. Show "Premium" badge, renewal date, or "Upgrade" CTA for free users.

- [ ] **[M]** Add 7-day free trial — Configure Stripe price with 7-day trial period. Update checkout flow to communicate trial:
  - "Start 7-day free trial"
  - Show trial end date after signup
  - Send reminder concept (documented) before trial expires

- [ ] **[S]** Handle subscription edge cases — Implement graceful handling for:
  - Payment failure: show banner "Update payment method", link to customer portal
  - Subscription canceled: continue access until period end, then downgrade
  - Resubscription: restore premium access immediately
  - Multiple devices: subscription status synced via AuthContext

- [ ] **[S]** Add Stripe to analytics — Track conversion events:
  - `paywall_shown` — when paywall component renders
  - `checkout_started` — when user clicks subscribe
  - `subscription_created` — when payment succeeds
  - `subscription_canceled` — when user cancels

## Acceptance Criteria

- Free users can play with limited content (50 questions, romantic audience only, no spicy cards)
- Premium subscription can be purchased via Stripe Checkout (monthly or yearly)
- Webhook correctly processes all subscription lifecycle events
- Premium users have immediate access to all content after payment
- Customer portal allows managing subscription and payment methods
- Paywall component clearly communicates value of premium tier
- 7-day free trial works end-to-end (no charge during trial)
- Subscription status is accurate and synced across devices
- Payment failures are handled gracefully with clear user messaging
- No premium content is accessible without a valid subscription (enforced server-side)
