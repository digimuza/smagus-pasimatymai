# Sprint 5: Internationalization

**Status:** Complete
**Depends on:** Sprint 4
**Blocks:** Sprint 6

## Goal

Make the app fully multilingual, starting with Lithuanian (lt) and English (en). All UI strings are externalized into message files, locale-aware routing is configured via next-intl middleware, and users can switch languages from the landing page nav.

## What Was Built

### Architecture
- **next-intl** with App Router integration: middleware for locale detection, `[locale]` dynamic segment in app directory, `NextIntlClientProvider` in locale layout
- **Locale prefix strategy:** `as-needed` — Lithuanian (default) has no URL prefix (`/game`), English uses prefix (`/en/game`)
- **Locale-aware navigation:** Custom `i18n/navigation.ts` exports `Link`, `useRouter`, `usePathname` that auto-handle locale prefixing
- **Message files:** `messages/lt.json` and `messages/en.json` with ~100 namespaced translation keys

### Directory Restructure
The entire app route group was moved under a `[locale]` dynamic segment:
```
app/
  layout.tsx                    ← minimal root (metadata only)
  [locale]/
    layout.tsx                  ← server: html/body, NextIntlClientProvider, generateMetadata
    (app)/
      layout.tsx                ← client: QuestionProvider
      page.tsx                  ← landing (SSG with generateStaticParams)
      audience/page.tsx
      game/page.tsx
      categories/page.tsx
      settings/page.tsx
      awesome/page.tsx
  api/                          ← moved out of (app) to avoid locale prefix
    game-data/route.ts
    analytics/route.ts
  (payload)/admin/              ← unchanged, excluded by middleware
```

### Landing Page Extraction
The monolithic landing page was split into 12 focused components in `components/landing/`:
- `LandingNav` — sticky nav with logo + language switcher
- `HeroSection` — headline, description, animated card, CTA
- `AnimatedCard` — rotating sample questions from translations
- `ModeShowcase` + `ModeCard` — three audience mode cards
- `HowItWorks` — 3-step explanation
- `FeaturesGrid` — stats (500+ questions, spicy challenges, 13 categories)
- `SocialProof` — testimonial + star rating
- `BottomCTA` — secondary call to action
- `LandingFooter` — copyright
- `LanguageSwitcher` — flag buttons using next-intl's `useRouter().replace()`
- `FloatingParticles`, `BackgroundGlow` — visual effects (no text)

### String Extraction
All ~100 hardcoded Lithuanian strings extracted across:
- 6 game pages (game, categories, settings, awesome, audience, landing)
- 5 shared components (Sidebar, AudienceSelector, SwipeCard, SpicyCardDisplay, Header)
- QuestionContext (loading state, API locale param, session tracking locale)
- Translation namespaces: `common`, `metadata`, `landing`, `audience`, `game`, `categories`, `settings`, `sidebar`, `awesome`

### Locale-Aware Features
- API route accepts `?locale=` parameter, passed from QuestionContext using `useLocale()`
- Session tracking sends actual locale to analytics
- Landing page SSR metadata (`title`, `description`, `openGraph`) generated per locale via `getTranslations()`
- Audience names/descriptions translated (not hardcoded in `AUDIENCE_DEFAULTS`)

## Tasks

- [x] **[M]** Install and configure `next-intl` — middleware, routing, request config, plugin in next.config.mjs
- [x] **[M]** Create message files — `messages/lt.json` and `messages/en.json` with ~100 namespaced keys
- [x] **[L]** Restructure app directory — move `app/(app)/` → `app/[locale]/(app)/`, move API routes to `app/api/`
- [x] **[L]** Extract all hardcoded Lithuanian strings — ~100 strings across 11 files replaced with `useTranslations()` calls
- [x] **[M]** Create locale-aware navigation — `i18n/navigation.ts` with `createNavigation(routing)`, all components updated
- [x] **[L]** Extract landing page into components — 12 new components in `components/landing/`, all using translations
- [x] **[S]** Build locale switcher — flag-based switcher in landing nav using `router.replace(pathname, { locale })`
- [x] **[S]** Add locale to analytics — QuestionContext passes `useLocale()` to `useSessionTracking` and API fetch
- [x] **[S]** Add SSR metadata — `generateMetadata` in locale layout and landing page with translated titles/descriptions
- [x] **[S]** Build verification — `npm run build` passes with zero errors, only lt/en locales generated

## Design Decisions

1. **`as-needed` locale prefix** — Default locale (lt) has clean URLs without prefix. Only non-default locales get prefixed (`/en/game`). This preserves existing Lithuanian URLs for SEO.
2. **Client-side locale from next-intl** — Instead of managing locale in localStorage (like audience), we use next-intl's built-in URL-based locale detection + middleware. This gives proper SSR locale support.
3. **No Polish locale** — Removed `pl` from config. Easy to add back later by creating `messages/pl.json` and adding `'pl'` to the locales array.
4. **Audience names via translations** — `AUDIENCE_DEFAULTS` still provides icon/color/sortOrder, but display names come from `t('audience.${slug}.name')` for proper i18n.
5. **API locale as query param** — The `/api/game-data` route accepts `?locale=` to fetch content in the correct language from PayloadCMS.

## Files Changed

| Action | File |
|--------|------|
| Create | `i18n/config.ts`, `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts` |
| Create | `middleware.ts` |
| Create | `messages/lt.json`, `messages/en.json` |
| Create | `app/[locale]/layout.tsx`, `app/[locale]/(app)/layout.tsx` |
| Create | `app/[locale]/(app)/page.tsx` + 5 game pages |
| Create | 12 components in `components/landing/` |
| Create | `app/api/game-data/route.ts`, `app/api/analytics/route.ts` |
| Modify | `app/layout.tsx` — simplified to metadata-only root |
| Modify | `next.config.mjs` — added next-intl plugin |
| Modify | `context/QuestionContext.tsx` — useLocale(), translated loading, locale in API fetch |
| Modify | `components/Sidebar.tsx`, `AudienceSelector.tsx`, `SwipeCard.tsx`, `SpicyCardDisplay.tsx` |
| Modify | `components/ui/Header.tsx` — locale-aware navigation + translated aria-labels |
| Delete | `app/(app)/` — entire route group (moved to `app/[locale]/(app)/`) |
| Delete | `messages/pl.json` — removed unused Polish messages |
