# Sprint 2: Statistics & Analytics

**Status:** Not Started
**Depends on:** Sprint 1
**Blocks:** Sprint 9

## Goal

Track how users interact with the game — which questions they see, skip, favorite, and how long sessions last. Store events in Payload collections and surface insights in the admin dashboard. Use batched analytics to minimize performance impact.

## Tasks

- [ ] **[M]** Create `GameSessions` collection — New collection in `collections/GameSessions.ts` with fields: `sessionId` (text, unique), `startedAt` (date), `endedAt` (date), `audience` (select), `locale` (select), `questionsViewed` (number), `questionsSkipped` (number), `spicyCardsViewed` (number), `duration` (number, seconds), `device` (text, user-agent summary).

- [ ] **[M]** Create `QuestionEvents` collection — New collection in `collections/QuestionEvents.ts` with fields: `sessionId` (relationship to GameSessions), `questionId` (relationship to Questions), `eventType` (select: `viewed`, `skipped`, `favorited`, `unfavorited`, `shared`), `timestamp` (date), `timeSpent` (number, milliseconds).

- [ ] **[M]** Build analytics API route — Create `app/(app)/api/analytics/route.ts` with POST handler that accepts batched events (array of QuestionEvents + session update). Use Payload local API to insert. Validate payload shape with zod.

- [ ] **[S]** Implement client-side event batching — Create `lib/analytics.ts` with an `AnalyticsBuffer` class that queues events in memory and flushes every 10 seconds or on page unload (using `navigator.sendBeacon`). Export `trackEvent(type, questionId, metadata)` function.

- [ ] **[M]** Integrate event tracking into swipe actions — In `context/QuestionContext.tsx`, call `trackEvent` on: question viewed (card appears), question skipped (swipe left), question favorited (heart tap), spicy card viewed. Track session start/end.

- [ ] **[S]** Generate unique session IDs — Create `lib/sessionId.ts` that generates a UUID v4 session ID on app load and stores it in sessionStorage. New tab = new session.

- [ ] **[S]** Track session duration — In `context/QuestionContext.tsx` or a dedicated `useSessionTracking` hook, record `startedAt` on mount and send `endedAt` on unmount/beforeunload.

- [ ] **[L]** Build Payload admin statistics dashboard — Create a custom Payload admin view at `app/(payload)/admin/statistics/page.tsx` showing:
  - Total sessions (today, this week, all time)
  - Most viewed questions (top 20)
  - Most skipped questions (top 20)
  - Average session duration
  - Audience distribution pie chart
  - Use Payload's admin UI components and aggregate queries.

- [ ] **[S]** Add indexes for analytics queries — Add database indexes on `QuestionEvents.sessionId`, `QuestionEvents.eventType`, `QuestionEvents.timestamp`, and `GameSessions.startedAt` for performant aggregation.

- [ ] **[S]** Add data retention policy — Create a Payload `afterChange` hook or scheduled job concept (documented, not implemented as cron yet) that describes purging raw QuestionEvents older than 90 days while keeping aggregated summaries.

## Acceptance Criteria

- Every question view, skip, and favorite action creates a QuestionEvent in the database
- Events are batched client-side (not sent one-by-one) and flushed on page unload
- Admin dashboard at `/admin/statistics` shows meaningful charts with real data
- Session tracking works across page navigations within the same tab
- Analytics API validates input and rejects malformed payloads
- No measurable performance degradation in the game UI (events are async, non-blocking)
