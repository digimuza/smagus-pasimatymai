# Sprint 5: Internationalization

**Status:** Not Started
**Depends on:** Sprint 4
**Blocks:** Sprint 6

## Goal

Make the app fully multilingual, starting with Lithuanian (lt) and English (en). All UI strings should be externalized into message files, PayloadCMS content should use native localization, and users should be able to switch languages from the UI. Provide an admin tool concept for auto-translating content.

## Tasks

- [ ] **[M]** Install and configure `next-intl` — Install `next-intl`. Set up the middleware in `middleware.ts` for locale detection (cookie → Accept-Language → default `lt`). Configure `i18n/config.ts` with supported locales `['lt', 'en']` and default locale `lt`.

- [ ] **[M]** Create message files — Create `messages/lt.json` and `messages/en.json` with namespaced keys:
  - `common`: buttons (next, back, start, skip), labels, errors
  - `game`: question counter, category names, spicy card labels
  - `settings`: all settings labels and descriptions
  - `audiences`: audience names and descriptions
  - `landing`: (placeholder for Sprint 6)

- [ ] **[L]** Catalog and extract all hardcoded Lithuanian strings — Audit every file in `app/`, `components/`, and `context/` for hardcoded Lithuanian text. Replace each with `useTranslations()` calls. Expected: ~80 strings.

- [ ] **[S]** Set up `next-intl` provider — Wrap the app layout in `app/(app)/layout.tsx` with `NextIntlClientProvider`. Pass messages from server component to client components.

- [ ] **[M]** Configure PayloadCMS native localization — Update `payload.config.ts` to enable `localization: { locales: ['lt', 'en'], defaultLocale: 'lt', fallback: true }`. Update all text/textarea/richText fields in collections to be localized.

- [ ] **[S]** Update seed script for localized content — Modify `scripts/seed.ts` to insert Lithuanian content under the `lt` locale key. English translations can be empty initially (filled via auto-translate or manually).

- [ ] **[M]** Update API layer for locale — Modify `lib/api.ts` to pass `locale` parameter to all Payload API calls. Payload REST API supports `?locale=en` natively. Ensure fallback to `lt` if translation is missing.

- [ ] **[S]** Build locale switcher component — Create `components/LocaleSwitcher.tsx` using the design system `Select` component. Shows flag + language name. On change, updates the cookie and reloads content. Place in the Header or Settings page.

- [ ] **[M]** Translate UI strings to English — Manually translate all keys in `messages/en.json`. This is the initial high-quality translation of the ~80 UI strings.

- [ ] **[S]** Add locale to URL structure — Configure `next-intl` routing so URLs are prefixed with locale: `/lt/game`, `/en/game`. Default locale (`lt`) can optionally hide the prefix.

- [ ] **[M]** Design auto-translation admin tool — Document (in this sprint file or a separate design doc) a Payload admin action that takes untranslated content and sends it to an LLM API (Claude or GPT) for translation. Implement a basic version as a Payload admin UI button that translates a single question.

- [ ] **[S]** Add locale to analytics events — Update `lib/analytics.ts` to include the current locale in every event and session, so usage can be tracked per language.

## Acceptance Criteria

- App renders fully in Lithuanian by default with zero hardcoded strings in components
- Switching to English shows all UI elements in English (buttons, labels, navigation)
- PayloadCMS admin allows editing content in both `lt` and `en` locales
- API correctly returns content in the requested locale with fallback to Lithuanian
- Locale preference persists across sessions (stored in cookie)
- URL structure reflects the current locale (`/en/game` vs `/lt/game`)
- No layout breaks when switching between languages (Lithuanian text is often longer than English)
- Analytics events include locale information
