# SAN-1: Migrate from Payload CMS to Drizzle ORM

## Goal
Remove Payload CMS packages entirely. Replace with clean Next.js + Drizzle ORM stack.

## Collections (14 total)
Map each Payload collection to a Drizzle schema:

### Core Entities
1. **players** - 14 fields: name, avatar, email (unique), provider, providerId, locale, preferredAudience, activeCategories (JSON), currentStreak, longestStreak, lastPlayedDate, spicySettings (JSON group)
2. **subscriptions** - playerId FK (unique), stripeCustomerId, stripeSubscriptionId, plan, status, currentPeriodStart/End, cancelAtPeriodEnd, trialEnd
3. **categories** - name (unique), type, sortOrder, locale
4. **questions** - question, categoryId FK, legacyId, locale, audience, status
5. **spicy_card_types** - slug (unique), label, icon, color, locale
6. **spicy_cards** - title, description, cardTypeId FK, locale, audience, status
7. **audiences** - slug (unique), name, description, icon, color, isActive, sortOrder
8. **daily_questions** - date (unique), questionId FK, audience
9. **question_submissions** - text, audience, submittedBy FK, status, moderatorNote

### Analytics Entities
10. **player_progress** - playerId FK, questionId, audience, status, viewedAt
11. **game_sessions** - sessionId (unique), playerId FK (optional), startedAt, endedAt, audience, locale, questionsViewed, questionsSkipped, spicyCardsViewed, duration, device
12. **question_events** - sessionId, questionId, eventType, timestamp, timeSpent
13. **stripe_events** - eventId (unique), eventType

### Admin (minimal)
14. **users** - email (unique), password hash, role

## Migration Steps

### Phase 1: Setup Drizzle
- [ ] Install: `drizzle-kit`, `drizzle-orm`, `postgres`, `@neondatabase/serverless` (or `pg` with `pg-pool`)
- [ ] Create `drizzle.config.ts` with DATABASE_URL
- [ ] Create `drizzle/schema/` with all 14 schemas
- [ ] Generate migration: `drizzle-kit generate`
- [ ] Run migration (keep existing Postgres DB — don't drop data)

### Phase 2: Replace Payload in lib/api.ts
Replace `lib/api.ts` functions to use Drizzle instead of Payload:
- `getAllCategoriesWithQuestions()` — raw SQL join or Drizzle queries
- `getAllSpicyCards()` — Drizzle queries with relation expansion

### Phase 3: Replace Payload in API Routes
All routes in `app/api/` that import `@payload-config` or use `getPayload()`:
- `app/api/game-data/route.ts` — replace `payload.find()` with Drizzle
- `app/api/progress/route.ts` — needs checking
- `app/api/streak/route.ts` — needs checking
- `app/api/daily-question/route.ts` — needs checking
- `app/api/checkout/route.ts` — needs checking
- `app/api/billing/portal/route.ts` — needs checking
- `app/api/webhooks/stripe/route.ts` — needs checking
- `app/api/submit-question/route.ts` — needs checking
- `app/api/analytics/route.ts` — needs checking
- `app/api/auth/google/callback/route.ts` — replace `payload.find/create/update/login` with Drizzle

### Phase 4: Replace Payload Auth
- Remove Payload auth entirely. Use Lucia Auth or NextAuth for session management.
- Google OAuth callback should create player via Drizzle, set session cookie directly.
- Remove `lib/payload.ts` and `payload.config.ts`.

### Phase 5: Rewrite Admin UI
- Remove Payload admin (`/admin` routes)
- Create custom admin pages at `app/admin/`:
  - Dashboard with stats
  - Question management (CRUD)
  - Category management
  - Analytics dashboard
- Use server actions + Drizzle for admin operations.

### Phase 6: Remove Payload Packages
```bash
pnpm remove payload @payloadcms/db-postgres @payloadcms/next @payloadcms/richtext-lexical
```
- Remove `payload.config.ts`
- Remove `collections/` directory
- Remove Payload admin components
- Fix all import errors from removed modules

### Phase 7: Fix Build
- Run `pnpm build` and fix all TypeScript/import errors
- Ensure all API routes work end-to-end

## Key Notes
- Keep existing Postgres DB and data intact — only change query layer
- Maintain API response shapes (don't break the frontend)
- Keep Google OAuth flow working
- Session management needs replacement (currently uses Payload token cookie)

## Project Location
`/Users/digimuza/Documents/projects/smagus-pasimatymai/`
