# Sprint 3: Audience Expansion

**Status:** Complete
**Depends on:** Sprint 1
**Blocks:** Sprint 9

## Goal

Expand the game beyond romantic couples to serve families, kids, and friend groups. Each audience gets its own curated question set and audience-appropriate spicy cards. The UI lets users pick their audience at the start and filters all content accordingly.

## Design Decision

Kept `audience` as a SELECT field on Questions and SpicyCards (no risky DB migration). Created an `Audiences` collection purely for UI metadata (name, icon, color, description). The audience slug values match the existing select options.

## Tasks

- [x] **[M]** Create `Audiences` collection — `collections/Audiences.ts` with fields: slug (unique), name, description, icon, color, isActive, sortOrder. Public read, auth write. Registered in `payload.config.ts`. Added `Audience` interface to `payload-types.ts`.

- [x] **[S]** Create audience type definitions — `types/audience.ts` with `AudienceSlug` type, `AudienceMetadata` interface, and `AUDIENCE_DEFAULTS` array (hardcoded fallback for client-side rendering of the 4 audiences).

- [x] **[S]** Seed default audiences — Added to `scripts/seed.ts`: creates 4 audience records (romantic, family, kids, friends) with Lithuanian names, descriptions, icons, and colors. Idempotent by slug.

- [x] **[M]** Wire audience into QuestionContext — Added `audience: string | null` to localStorage state. API fetch gated on `state.audience` being truthy. Passes `?audience=` to `/api/game-data`. `setAudience(slug)` clears questionStates/activeCategories/currentQuestionId. Fixed `useSessionTracking` to use dynamic audience.

- [x] **[M]** Build audience selector page — `components/AudienceSelector.tsx` as full-screen grid of 4 audience cards with framer-motion animations. `app/(app)/audience/page.tsx` route. On tap: sets audience then navigates to `/game`.

- [x] **[M]** Game flow integration:
  - `app/(app)/game/page.tsx` — redirects to `/audience` if no audience selected; shows audience icon in header.
  - `app/(app)/page.tsx` — CTA href changed from `/game` to `/audience`.
  - `components/Sidebar.tsx` — added "Pakeisti režimą" button with current audience icon.
  - `app/(app)/categories/page.tsx` — hides "Intymios kategorijos" section when `audience === 'kids'`.

- [x] **[S]** Kids safety + empty category filtering — `lib/api.ts` filters out sections with 0 questions (prevents empty categories) and additionally filters out `type === 'intimate'` sections when `audience === 'kids'`.

- [x] **[XL]** Write 104 family questions — `scripts/data/family-questions.json` across 8 categories: Šeimos prisiminimai, Vertybės ir pamokos, Svajonės ir ateitis, Dėkingumas, Linksmi klausimai, Emocijos ir jausmai, Kasdienybė, Kartų ryšys.

- [x] **[L]** Write 56 kids questions — `scripts/data/kids-questions.json` across 6 categories: Gyvūnai ir gamta, Vaizduotė ir svajonės, Mėgstami dalykai, Juokingi klausimai, Draugystė, Nuotykiai. Simple Lithuanian, age-appropriate.

- [x] **[XL]** Write 104 friends questions — `scripts/data/friends-questions.json` across 8 categories: Gilūs pokalbiai, Ar norėtum, Gėdingi prisiminimai, Nuomonės, Draugystė, Iššūkiai ir žaidimai, Hipotezės, Vakarėlių klausimai.

- [x] **[M]** Create audience-specific spicy cards — 15 family cards (wholesome: compliment, hug, challenge, truth, dance), 15 kids cards (silly safe dares — NO kiss/whisper/dare/slap/massage), 16 friends cards (party-style challenges).

- [x] **[S]** Update seed script — Seeds Audiences collection (4 records), then for each new audience: reads JSON, creates categories if needed, creates questions with correct audience value. Idempotent by question text + audience + category.

## Files Changed

| Action | File |
|--------|------|
| Create | `collections/Audiences.ts` |
| Create | `types/audience.ts` |
| Create | `components/AudienceSelector.tsx` |
| Create | `app/(app)/audience/page.tsx` |
| Create | `scripts/data/family-questions.json` |
| Create | `scripts/data/kids-questions.json` |
| Create | `scripts/data/friends-questions.json` |
| Create | `scripts/data/family-spicy-cards.json` |
| Create | `scripts/data/kids-spicy-cards.json` |
| Create | `scripts/data/friends-spicy-cards.json` |
| Modify | `payload.config.ts` |
| Modify | `payload-types.ts` |
| Modify | `types/index.ts` |
| Modify | `context/QuestionContext.tsx` |
| Modify | `app/(app)/game/page.tsx` |
| Modify | `app/(app)/page.tsx` |
| Modify | `components/Sidebar.tsx` |
| Modify | `app/(app)/categories/page.tsx` |
| Modify | `lib/api.ts` |
| Modify | `scripts/seed.ts` |

## Acceptance Criteria

- [x] Audience selector appears on first launch or when no audience is selected
- [x] Selecting "Family" shows only family questions and family-appropriate spicy cards
- [x] Kids audience has no intimate/adult content in questions or spicy cards
- [x] Each audience has a meaningful number of questions (romantic: 576, family: 104, kids: 56, friends: 104)
- [x] Audience selection persists across page reloads (localStorage)
- [x] API correctly filters by audience — no cross-audience content leaks
- [x] Switching audiences resets the question queue and viewed state
- [x] `npm run build` passes with zero errors
