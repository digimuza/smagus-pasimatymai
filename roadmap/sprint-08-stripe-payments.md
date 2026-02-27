# Sprint 8: Stripe Payments

**Status:** Complete
**Depends on:** Sprint 7
**Blocks:** Sprint 9

## Goal

Monetize the app with a freemium model using Stripe subscriptions. Free users get access to a limited question set and one audience. Premium users unlock all questions, all audiences, spicy cards, and advanced features.

## What Was Built

### Stripe Integration
- **`lib/stripe.ts`** — Lazy-initialized Stripe client (v20, API `2026-02-25.clover`) with plan definitions (monthly €4.99, yearly €29.99). Proxy pattern avoids build-time initialization errors.
- **`lib/subscription.ts`** — Content gating helpers: `isPremium()`, `canAccessAudience()`, `canAccessSpicyCards()`, `getQuestionLimit()`, `limitQuestions()`.

### Collections & Data Model
- **`collections/Subscriptions.ts`** — Payload collection tracking player subscriptions with fields: player (relationship), stripeCustomerId, stripeSubscriptionId, plan (free/monthly/yearly), status (active/canceled/past_due/trialing/expired), currentPeriodStart/End, cancelAtPeriodEnd, trialEnd.

### API Routes
- **`app/api/checkout/route.ts`** — Creates Stripe Checkout Session with 7-day trial, finds/creates Stripe customer, returns checkout URL.
- **`app/api/billing/portal/route.ts`** — Creates Stripe Customer Portal session for subscription management.
- **`app/api/webhooks/stripe/route.ts`** — Handles all subscription lifecycle events:
  - `checkout.session.completed` — creates/updates subscription record
  - `invoice.paid` — extends subscription period
  - `invoice.payment_failed` — marks as past_due
  - `customer.subscription.updated` — syncs status changes
  - `customer.subscription.deleted` — marks as expired

### UI Components
- **`components/payments/Paywall.tsx`** — Bottom sheet with plan selector (monthly/yearly), premium features list, 7-day trial CTA.
- **`components/payments/SubscriptionBadge.tsx`** — Gradient "Premium" badge or "Free" badge based on subscription.

### Content Gating
- **`context/QuestionContext.tsx`** — Limits questions to 50 for free users, gates spicy cards behind premium, exposes `isContentLimited` and `showPaywall` state.
- **`components/AudienceSelector.tsx`** — Shows "PRO" badge on premium-only audiences, opens paywall when free users tap locked audiences.
- **`app/[locale]/(app)/game/page.tsx`** — Shows paywall when free users exhaust question limit instead of redirecting to awesome page.
- **`app/[locale]/(app)/profile/page.tsx`** — Shows subscription badge, "Manage subscription" button for premium users (opens Stripe Customer Portal).

### Auth Context Updates
- **`context/AuthContext.tsx`** — Added `PlayerSubscription` interface and subscription state. Fetches subscription data from Payload API after player authentication. Exposes subscription in context.

### i18n
- Added `payments` translation section in both `lt.json` and `en.json` with all paywall, badge, and subscription management strings.

## Completed Tasks

- [x] **[M]** Define free vs premium tiers
- [x] **[M]** Create Subscriptions collection
- [x] **[M]** Set up Stripe SDK and config
- [x] **[L]** Build Stripe webhook handler
- [x] **[M]** Build checkout API route
- [x] **[S]** Build customer portal route
- [x] **[M]** Build paywall UI
- [x] **[M]** Implement content gating
- [x] **[S]** Build subscription status UI
- [x] **[M]** Add 7-day free trial

## Technical Notes

- Stripe v20 (`2026-02-25.clover`) moves `current_period_start/end` from Subscription to SubscriptionItem level. Webhook handler accesses via `subscription.items.data[0]`.
- Invoice `subscription` property moved to `invoice.parent?.subscription_details?.subscription` in Stripe v20.
- Stripe client uses lazy initialization via Proxy to avoid build-time errors when env vars aren't set.
- Content gating is client-side (QuestionContext) to keep API responses cacheable. The 50-question limit uses `slice(0, limit)` for deterministic ordering.
- Free users: 50 questions, romantic audience only, no spicy cards.
- Premium users: all questions, all audiences, spicy cards, progress sync.
