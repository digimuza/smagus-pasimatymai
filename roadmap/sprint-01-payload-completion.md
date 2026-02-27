# Sprint 1: PayloadCMS Completion

**Status:** Not Started
**Depends on:** —
**Blocks:** Sprint 2, Sprint 3, Sprint 4, Sprint 7

## Goal

Complete the PayloadCMS integration so that all content (questions, categories, spicy cards) is served dynamically from the database. Remove all hardcoded data from the frontend. Ensure the seed script is idempotent and types are auto-generated.

## Tasks

- [ ] **[S]** Verify seed script runs cleanly — Run `scripts/seed.ts` against a fresh database and confirm all 576 questions, 12 categories, and 50+ spicy cards are inserted without errors.

- [ ] **[S]** Generate Payload types — Run `npx payload generate:types` and verify the output in `payload-types.ts`. Ensure all collections (Questions, Categories, SpicyCards, SpicyCardTypes, Users) produce correct TypeScript interfaces.

- [ ] **[M]** Add `locale` field to all content collections — Add a `locale` select field (`lt`, `en`) with default `lt` to `collections/Questions.ts`, `collections/Categories.ts`, `collections/SpicyCards.ts`, and `collections/SpicyCardTypes.ts`.

- [ ] **[M]** Add `audience` field to Questions and SpicyCards — Add a `audience` select field (`romantic`, `family`, `kids`, `friends`) with default `romantic` to `collections/Questions.ts` and `collections/SpicyCards.ts`.

- [ ] **[M]** Update API routes with filtering — Modify `lib/api.ts` to accept `locale` and `audience` query parameters. Update all `fetch` calls to pass these filters to the Payload REST API (`where[locale][equals]=lt`).

- [ ] **[S]** Update QuestionContext to use API data — Refactor `context/QuestionContext.tsx` to fetch questions from `lib/api.ts` instead of importing from `lib/constants.ts`. Add loading and error states.

- [ ] **[S]** Remove hardcoded data from `lib/constants.ts` — Delete all question/category arrays from `lib/constants.ts`. Keep only non-content constants (colors, config values). If the file becomes empty, delete it.

- [ ] **[S]** Remove `public/data.json` — Delete the static data export. Verify no components import from this path.

- [ ] **[M]** Make seed script idempotent — Update `scripts/seed.ts` to use upsert logic (find-or-create by a unique key like `text` hash or `slug`). Running the script twice should not create duplicates.

- [ ] **[S]** Add Payload admin panel customization — Add a custom dashboard component in `app/(payload)/` that shows content counts (total questions, categories, spicy cards) and a quick-seed button.

- [ ] **[S]** Write collection access control — Add `access` rules to all collections: admin users can CRUD everything, public users can only read published content. Add a `status` field (`draft` | `published`) to Questions and SpicyCards.

## Acceptance Criteria

- `npm run build` completes with zero TypeScript errors
- Seed script can run multiple times without creating duplicate records
- All questions, categories, and spicy cards are fetched from Payload API (no imports from `lib/constants.ts` or `public/data.json`)
- Payload admin panel at `/admin` shows all collections with correct data
- `locale` and `audience` fields exist on all relevant collections and are filterable via API
- Generated `payload-types.ts` is up to date and used by frontend code
