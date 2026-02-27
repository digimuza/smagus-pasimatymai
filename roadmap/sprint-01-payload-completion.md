# Sprint 1: PayloadCMS Completion

**Status:** Done
**Depends on:** —
**Blocks:** Sprint 2, Sprint 3, Sprint 4, Sprint 7

## Goal

Complete the PayloadCMS integration so that all content (questions, categories, spicy cards) is served dynamically from the database. Remove all hardcoded data from the frontend. Ensure the seed script is idempotent and types are auto-generated.

## Tasks

- [x] **[S]** Verify seed script runs cleanly — Run `scripts/seed.ts` against a fresh database and confirm all 576 questions, 16 categories, and 120 spicy cards are inserted without errors. Verified: seed creates all records with locale/audience/status fields.

- [x] **[S]** Generate Payload types — Generated `payload-types.ts` with all collections (Questions, Categories, SpicyCards, SpicyCardTypes, Users) producing correct TypeScript interfaces including new locale/audience/status fields. Note: `npx payload generate:types` has a tsx/@next/env incompatibility; types are generated via `next build` or manually.

- [x] **[M]** Add `locale` field to all content collections — Added `locale` select field (`lt`, `en`) with default `lt` to `collections/Questions.ts`, `collections/Categories.ts`, `collections/SpicyCards.ts`, and `collections/SpicyCardTypes.ts`.

- [x] **[M]** Add `audience` field to Questions and SpicyCards — Added `audience` select field (`romantic`, `family`, `kids`, `friends`) with default `romantic` to `collections/Questions.ts` and `collections/SpicyCards.ts`.

- [x] **[M]** Update API routes with filtering — Modified `lib/api.ts` to accept `locale` and `audience` parameters. Updated `app/(app)/api/game-data/route.ts` to read `?locale=` and `?audience=` query params and pass through.

- [x] **[S]** Remove hardcoded data from `lib/constants.ts` — Deleted `SAFE_CATEGORIES` and `INTIMATE_CATEGORIES` arrays. Kept `STORAGE_KEY`, `SWIPE_THRESHOLD`, `SWIPE_VELOCITY_THRESHOLD`.

- [x] **[S]** Delete dead code — Removed `lib/storage.ts` (unused, not imported anywhere) and root `data.json` (stale duplicate). Kept `public/data.json` as seed data source.

- [x] **[M]** Make seed script idempotent — Seed checks existence before creating: questions by `legacyId`, spicy cards by `title`+`cardType`, categories and card types by find-first. Running twice produces 0 new records.

- [x] **[S]** Add Payload admin panel customization — Created `components/admin/DashboardStats.tsx` showing content counts (questions, categories, spicy cards, card types). Registered via `admin.components.beforeDashboard` in payload config.

- [x] **[S]** Write collection access control — Added `access` rules to all 4 content collections: public read, authenticated-only create/update/delete. Added `status` field (`draft` | `published`) to Questions and SpicyCards.

- [x] **[S]** Fix seed script tsx compatibility — Created `scripts/load-env.ts` and `scripts/next-env-shim.ts` to work around `@next/env` + tsx incompatibility. Seed now loads env vars manually and shims `@next/env` for Payload.

## Acceptance Criteria

- [x] `npm run build` completes with zero TypeScript errors
- [x] Seed script can run multiple times without creating duplicate records
- [x] All questions, categories, and spicy cards are fetched from Payload API (no imports from `lib/constants.ts` for content data)
- [x] Payload admin panel at `/admin` shows all collections with correct data
- [x] `locale` and `audience` fields exist on all relevant collections and are filterable via API
- [x] Generated `payload-types.ts` is up to date with all new fields
