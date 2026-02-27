# Santykių Klausimai — Product Roadmap

## Overview

This roadmap covers the evolution of Santykių Klausimai from a static question game to a full-featured, monetized product with CMS-driven content, multiple audiences, internationalization, user accounts, and Stripe payments.

**Current state:** Next.js 15 + PayloadCMS 3 + PostgreSQL, 576 questions across 12 categories, 50+ spicy cards. Transitioning from static data (`lib/constants.ts`, `public/data.json`) to dynamic CMS backend.

**Target state:** Paid product with free tier, multiple audiences (couples, family, kids, friends), i18n (LT/EN), user accounts, analytics, and a marketing landing page.

## Sprint Overview

| Sprint | Name | Status | Size | Depends On |
|--------|------|--------|------|------------|
| 1 | [PayloadCMS Completion](sprint-01-payload-completion.md) | Complete | M | — |
| 2 | [Statistics & Analytics](sprint-02-statistics-analytics.md) | Complete | M | Sprint 1 |
| 3 | [Audience Expansion](sprint-03-audience-expansion.md) | Complete | L | Sprint 1 |
| 4 | [Design System](sprint-04-design-system.md) | Complete | L | Sprint 1 |
| 5 | [Internationalization](sprint-05-internationalization.md) | Complete | L | Sprint 4 |
| 6 | [Landing Page](sprint-06-landing-page.md) | Complete | M | Sprint 5 |
| 7 | [User Accounts](sprint-07-user-accounts.md) | Complete | L | Sprint 1 |
| 8 | [Stripe Payments](sprint-08-stripe-payments.md) | Complete | L | Sprint 7 |
| 9 | [Advanced Features](sprint-09-advanced-features.md) | Not Started | L | Sprints 2, 3, 4, 7, 8 |
| 10 | [Production Launch](sprint-10-production-launch.md) | Not Started | L | Sprint 9 |

## Dependency Graph

```
Sprint 1 (Payload Completion)
  ├──→ Sprint 2 (Analytics)          ──┐
  ├──→ Sprint 3 (Audiences)          ──┤
  ├──→ Sprint 4 (Design System)      ──┼──→ Sprint 9 (Advanced Features) ──→ Sprint 10 (Launch)
  │      └──→ Sprint 5 (i18n)          │
  │             └──→ Sprint 6 (Landing) │
  └──→ Sprint 7 (User Accounts)      ──┘
         └──→ Sprint 8 (Stripe)
```

**Parallel tracks after Sprint 1:** Sprints 2, 3, 4, and 7 can all begin simultaneously once Sprint 1 is complete. This is the critical path optimization — assigning parallel work here significantly reduces total delivery time.

## Legend

### Task Sizes

| Label | Meaning | Rough Effort |
|-------|---------|--------------|
| **XS** | Trivial change, config tweak | < 1 hour |
| **S** | Small, well-scoped task | 1–3 hours |
| **M** | Medium, may touch multiple files | 3–8 hours |
| **L** | Large, requires research or many files | 1–2 days |
| **XL** | Epic-level, consider splitting | 2+ days |

### Statuses

- **Not Started** — No work has begun
- **In Progress** — Actively being worked on
- **Blocked** — Waiting on a dependency
- **Complete** — Done and verified against acceptance criteria

## Key Files Reference

| Path | Description |
|------|-------------|
| `payload.config.ts` | PayloadCMS configuration |
| `collections/` | Payload collection definitions (Categories, Questions, SpicyCards, SpicyCardTypes, Users, GameSessions, QuestionEvents) |
| `lib/constants.ts` | Hardcoded question data (to be removed) |
| `lib/api.ts` | API client for fetching from Payload |
| `lib/payload.ts` | Payload local API helpers |
| `context/QuestionContext.tsx` | React context for question state management |
| `app/[locale]/(app)/` | User-facing app routes (locale-aware) |
| `app/(payload)/` | Payload admin panel routes |
| `scripts/` | Seed scripts and utilities |
| `lib/analytics.ts` | Client-side analytics buffer with batched flushing |
| `lib/sessionId.ts` | Per-tab session ID generation via sessionStorage |
| `hooks/useSessionTracking.ts` | React hook for session lifecycle tracking |
| `app/(app)/api/analytics/` | POST endpoint for batched analytics events |
| `components/admin/StatisticsDashboard.tsx` | Admin dashboard statistics widget |
| `public/data.json` | Static data export (to be replaced by CMS) |
