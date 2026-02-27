# Sprint 2: Statistics & Analytics

**Status:** Done
**Depends on:** Sprint 1
**Blocks:** Sprint 9

## Goal

Track how users interact with the game — which questions they see, skip, favorite, and how long sessions last. Store events in Payload collections and surface insights in the admin dashboard. Use batched analytics to minimize performance impact.

## Tasks

- [x] **[M]** Create `GameSessions` collection — Created `collections/GameSessions.ts` with fields: `sessionId` (text, unique, indexed), `startedAt` (date), `endedAt` (date), `audience` (select), `locale` (select), `questionsViewed` (number), `questionsSkipped` (number), `spicyCardsViewed` (number), `duration` (number, seconds), `device` (text). Access: public create, authenticated read/update/delete.

- [x] **[M]** Create `QuestionEvents` collection — Created `collections/QuestionEvents.ts` with fields: `sessionId` (text, indexed — not relationship, to allow anonymous writes), `questionId` (number, indexed), `eventType` (select: `viewed`, `skipped`, `answered`, `superliked`, `spicy_dismissed`, indexed), `timestamp` (date, indexed), `timeSpent` (number, milliseconds). Access: public create, authenticated read/update/delete.

- [x] **[M]** Build analytics API route — Created `app/(app)/api/analytics/route.ts` with POST handler that accepts batched events (array of QuestionEvents + session upsert). Uses Payload local API to insert events and create/update sessions. Inline validation (no zod dependency needed). No auth required for anonymous tracking.

- [x] **[S]** Implement client-side event batching — Created `lib/analytics.ts` with `AnalyticsBuffer` class that queues events in memory, auto-flushes every 10 seconds via `setInterval`, and flushes on `visibilitychange` (hidden) and `beforeunload` using `navigator.sendBeacon`. Exports singleton `analytics` instance and `trackEvent()` convenience function.

- [x] **[M]** Integrate event tracking into swipe actions — Modified `context/QuestionContext.tsx` to call `trackEvent` on: question viewed (in `loadNextQuestion`), question skipped (swipe left), question answered (swipe right), question superliked (swipe up), spicy card dismissed (any swipe). Added `questionViewedAt` ref for timeSpent calculation.

- [x] **[S]** Generate unique session IDs — Created `lib/sessionId.ts` using `sessionStorage` + `crypto.randomUUID()`. New tab = new session (sessionStorage is per-tab).

- [x] **[S]** Track session duration — Created `hooks/useSessionTracking.ts` hook that initializes `AnalyticsBuffer` with locale/audience metadata on mount and calls `destroy()` (which flushes with `endedAt`) on unmount. Called from `QuestionProvider`.

- [x] **[M]** Build admin statistics dashboard — Created `components/admin/StatisticsDashboard.tsx` as client component registered via `admin.components.afterDashboard` in payload config. Shows: total sessions (today/this week/all time), average session duration, total events, audience distribution table, top 20 viewed questions, top 20 skipped questions. Uses simple HTML tables with Payload admin CSS variables (no charting library).

- [x] **[S]** Add indexes for analytics queries — All key fields are indexed via Payload's `index: true` field option: `QuestionEvents.sessionId`, `QuestionEvents.eventType`, `QuestionEvents.timestamp`, `QuestionEvents.questionId`, `GameSessions.sessionId`.

## Acceptance Criteria

- [x] Every question view, skip, answer, superlike, and spicy card dismiss creates a QuestionEvent in the database
- [x] Events are batched client-side (not sent one-by-one) and flushed on page unload via sendBeacon
- [x] Admin dashboard on `/admin` shows session counts, top questions, and audience distribution
- [x] Session tracking works across page navigations within the same tab (sessionStorage-based)
- [x] Analytics API validates input and rejects malformed payloads
- [x] No measurable performance degradation in the game UI (events are async, non-blocking)
- [x] `npm run build` completes with zero TypeScript errors
