# Sprint 3: Audience Expansion

**Status:** Not Started
**Depends on:** Sprint 1
**Blocks:** Sprint 9

## Goal

Expand the game beyond romantic couples to serve families, kids, and friend groups. Each audience gets its own curated question set and audience-appropriate spicy cards. The UI should let users pick their audience at the start and filter all content accordingly.

## Tasks

- [ ] **[M]** Create `Audiences` collection — New collection in `collections/Audiences.ts` with fields: `slug` (text, unique: `romantic`, `family`, `kids`, `friends`), `name` (text), `description` (textarea), `icon` (text, emoji or icon name), `color` (text, hex), `ageRestriction` (number, minimum age), `isActive` (checkbox, default true), `sortOrder` (number).

- [ ] **[S]** Seed default audiences — Add to `scripts/seed.ts`: create the four audiences (romantic, family, kids, friends) with appropriate descriptions, icons, and colors.

- [ ] **[S]** Update Questions collection relationship — Change the `audience` field in `collections/Questions.ts` from a select to a relationship field pointing to the Audiences collection. Update seed script accordingly.

- [ ] **[S]** Update SpicyCards collection relationship — Same change for `collections/SpicyCards.ts` — replace audience select with relationship to Audiences.

- [ ] **[M]** Build audience selector UI — Create `components/AudienceSelector.tsx` as a full-screen or modal component shown before the game starts. Display audience cards with icon, name, description. Store selection in localStorage and QuestionContext.

- [ ] **[M]** Update QuestionContext for audience filtering — Modify `context/QuestionContext.tsx` to accept an `audienceSlug` parameter. Fetch only questions matching the selected audience. Reset question state when audience changes.

- [ ] **[S]** Update API filtering for audiences — Modify `lib/api.ts` to filter by audience relationship: `where[audience.slug][equals]=family`.

- [ ] **[XL]** Write 100+ family questions — Create a seed data file `scripts/data/family-questions.json` with 100+ age-appropriate family discussion questions across existing categories (or new family-specific categories). Cover topics: memories, values, dreams, gratitude, silly/fun.

- [ ] **[L]** Write 50+ kids questions — Create `scripts/data/kids-questions.json` with 50+ simple, fun questions suitable for ages 6–12. Use simple Lithuanian language. Categories: animals, imagination, favorites, silly, adventure.

- [ ] **[XL]** Write 100+ friends questions — Create `scripts/data/friends-questions.json` with 100+ questions for friend groups. Cover: deep conversations, would-you-rather, embarrassing stories, opinions, challenges.

- [ ] **[M]** Create audience-specific spicy cards — Create seed data files for family spicy cards (wholesome challenges), kids spicy cards (silly dares), and friends spicy cards (party-style challenges). 15+ cards per audience.

- [ ] **[S]** Add audience badge to game UI — Show a small badge/chip in the game header indicating the current audience (e.g., "Šeima" with family icon). Tapping it opens the audience selector.

- [ ] **[S]** Update category filtering per audience — Some categories may not apply to all audiences (e.g., "Intymu" shouldn't appear for kids). Add an `audiences` relationship (hasMany) to the Categories collection and filter accordingly.

## Acceptance Criteria

- Audience selector appears on first launch or when no audience is selected
- Selecting "Family" shows only family questions and family-appropriate spicy cards
- Kids audience has no intimate/adult content in questions or spicy cards
- Each audience has a meaningful number of questions (romantic: 576, family: 100+, kids: 50+, friends: 100+)
- Audience selection persists across page reloads (localStorage)
- API correctly filters by audience — no cross-audience content leaks
- Switching audiences resets the question queue and viewed state
