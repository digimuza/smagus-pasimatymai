# Sprint 10: Production Launch

**Status:** Not Started
**Depends on:** Sprint 9
**Blocks:** —

## Goal

Harden the application for production, set up CI/CD, monitoring, and launch publicly. Ensure the app is secure, performant, legally compliant, and ready for real users and payments.

## Tasks

- [ ] **[M]** Vercel deployment configuration — Set up Vercel project:
  - Configure environment variables (database URL, Stripe keys, OAuth secrets, Payload secret)
  - Set up preview deployments for PRs
  - Configure custom domain (`santykiuklausimai.lt` or similar)
  - Set up Vercel PostgreSQL or external database connection
  - Enable Vercel Analytics and Speed Insights

- [ ] **[M]** CI/CD with GitHub Actions — Create `.github/workflows/ci.yml`:
  - Run on push to `main` and all PRs
  - Steps: install dependencies, lint (`eslint`), type-check (`tsc --noEmit`), run tests, build
  - Create `.github/workflows/deploy.yml` for production deployment triggers
  - Add status badges to README

- [ ] **[M]** Sentry error monitoring — Install `@sentry/nextjs`. Configure:
  - `sentry.client.config.ts` and `sentry.server.config.ts`
  - Source maps upload in CI
  - Error boundaries in React components
  - Capture unhandled promise rejections
  - Set up Sentry alerts for error spikes

- [ ] **[M]** Performance optimization — Audit and optimize:
  - Bundle analysis (`@next/bundle-analyzer`) — identify and eliminate large dependencies
  - Image optimization (all images via `next/image`, WebP format)
  - Code splitting — ensure each route only loads its own code
  - API response caching with `Cache-Control` headers and `revalidate`
  - Database query optimization (check for N+1 queries in Payload)

- [ ] **[M]** Security audit — Review and harden:
  - CSRF protection on all mutation endpoints
  - Rate limiting on auth and payment endpoints (`lib/rateLimit.ts`)
  - Input validation on all API routes (zod schemas)
  - Content Security Policy headers in `next.config.mjs`
  - Stripe webhook signature verification (already in Sprint 8, verify)
  - SQL injection prevention (Payload handles this, but audit custom queries)
  - XSS prevention (verify no `dangerouslySetInnerHTML` without sanitization)

- [ ] **[M]** Database indexing and optimization — Review all collections and add indexes:
  - Questions: `audience`, `locale`, `category`, `status`
  - PlayerProgress: `player` + `questionId` (compound), `player` + `status`
  - GameSessions: `startedAt`, `audience`
  - QuestionEvents: `sessionId`, `eventType`, `timestamp`
  - Subscriptions: `player`, `stripeSubscriptionId`, `status`
  - Run `EXPLAIN ANALYZE` on common queries and optimize.

- [ ] **[L]** Automated test suite — Write tests covering critical paths:
  - Unit tests: `lib/subscription.ts` (content gating logic), `lib/streaks.ts`, `lib/analytics.ts`
  - Integration tests: API routes (analytics, progress, checkout, webhooks)
  - E2E tests (Playwright): game flow, authentication, payment flow (with Stripe test mode)
  - Target: 70%+ coverage on `lib/` and API routes

- [ ] **[S]** Health check endpoint — Create `app/(app)/api/health/route.ts` that checks:
  - Database connection (Payload ping)
  - Stripe API reachability
  - Return `200 OK` with status JSON or `503` with error details
  - Configure Vercel/uptime monitoring to hit this endpoint

- [ ] **[M]** Legal pages — Create Payload Globals for legal content and render as pages:
  - Privacy Policy (`/privacy`) — GDPR compliant, covers data collection, cookies, analytics, Stripe
  - Terms of Service (`/terms`) — usage rules, subscription terms, content guidelines
  - Cookie consent banner — implement with localStorage opt-in/opt-out
  - All pages in both Lithuanian and English

- [ ] **[S]** Social media and launch assets — Prepare:
  - Open Graph default image (1200x630) for the main site
  - App Store-style screenshots (if targeting PWA/mobile)
  - Social media post templates (Lithuanian and English)
  - Product Hunt launch copy (if applicable)

- [ ] **[S]** Environment configuration documentation — Create `.env.example` with all required environment variables documented:
  - Database: `DATABASE_URL`
  - Payload: `PAYLOAD_SECRET`
  - Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
  - OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET`
  - Sentry: `SENTRY_DSN`
  - General: `NEXT_PUBLIC_APP_URL`

- [ ] **[S]** Final pre-launch checklist — Verify before going live:
  - [ ] All environment variables set in Vercel
  - [ ] Stripe webhooks pointed to production URL
  - [ ] OAuth redirect URIs updated for production domain
  - [ ] Database seeded with production content
  - [ ] DNS configured and SSL certificate active
  - [ ] Sentry receiving test errors
  - [ ] Analytics pipeline working end-to-end
  - [ ] Legal pages accessible and content reviewed
  - [ ] Payment flow tested with real card in test mode
  - [ ] Performance: Lighthouse score ≥ 90 on all pages
  - [ ] Mobile: tested on iOS Safari, Android Chrome

## Acceptance Criteria

- App is deployed to production on a custom domain with SSL
- CI/CD pipeline runs on every PR: lint, type-check, test, build
- Sentry captures and alerts on production errors
- All pages score ≥ 90 on Lighthouse (Performance, Accessibility, SEO)
- Security headers present: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Rate limiting active on auth and payment endpoints
- Database queries perform within acceptable thresholds (< 100ms p95)
- Test suite passes with ≥ 70% coverage on critical paths
- Health check endpoint returns 200 and is monitored
- Privacy Policy and Terms of Service are accessible in both languages
- `.env.example` documents all required environment variables
- Pre-launch checklist is fully checked off
