# Engineering Standards — smagus-pasimatymai

This document is the authoritative coding standards reference for this project. It is loaded automatically by Claude Code on every session.

## Tech stack

- **Framework:** Next.js 15 (App Router), React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS, CSS Modules
- **DB:** PostgreSQL + Drizzle ORM
- **Auth:** JWT (jose), Google OAuth
- **Payments:** Stripe
- **i18n:** next-intl (Lithuanian + English)
- **Testing:** Vitest (unit), Playwright (E2E)
- **Linting/Formatting:** Biome
- **Package manager:** pnpm

## Development commands

```bash
pnpm dev           # start dev server on :7743
pnpm build         # production build
pnpm typecheck     # TypeScript check (no emit)
pnpm lint          # Biome check + auto-fix
pnpm lint:check    # Biome check only (CI mode)
pnpm test          # Vitest unit tests
pnpm test:coverage # Vitest with coverage report
pnpm test:e2e      # Playwright E2E
pnpm test:watch    # Vitest watch mode
pnpm db:migrate    # run Drizzle migrations
pnpm db:studio     # open Drizzle Studio
```

## Code style

Biome enforces style automatically. Key conventions:

- **Indentation:** tabs (not spaces)
- **Quotes:** double quotes for JS/TS strings
- **Imports:** sorted automatically by Biome assist
- **Interface keys:** sorted automatically by Biome assist
- Never disable Biome rules inline unless the workaround is documented with a `// WHY:` comment explaining the specific constraint
- Cognitive complexity limit: 25 — if a function exceeds this, split it

### TypeScript

- `strict: true` is non-negotiable — do not loosen it
- Prefer `interface` over `type` for object shapes
- No `any` in `app/`, `lib/`, `components/` — use `unknown` + narrowing or a proper type
- `any` is allowed only in `scripts/` (override already in biome.json)
- Always use explicit return types on exported functions
- Zod for runtime validation at system boundaries (API routes, form submissions, webhooks)

### React / Next.js

- Server Components by default; add `"use client"` only when required for interactivity or browser APIs
- Never put secrets or DB calls in Client Components
- Prefer named exports — no default exports except for Next.js page/layout files (required by framework)
- Co-locate component-specific styles in CSS Modules alongside the component file
- Use `next/image` for all images (unless overriding for a documented reason)
- Tailwind class sorting is enforced via Biome (`cn`, `clsx`, `cva` helpers are recognised)

## File structure

```
app/[locale]/          # Next.js App Router pages (i18n via next-intl)
app/api/               # API route handlers
components/            # Shared React components
lib/                   # Pure business logic, utilities, DB queries
  __tests__/           # Unit tests (Vitest) — mirror lib/ structure
messages/              # i18n translation files (en.json, lt.json)
scripts/               # One-off CLI scripts (db seed, etc.)
e2e/                   # Playwright E2E tests
public/                # Static assets
```

## Testing requirements

### Unit tests (Vitest)

- Location: `lib/__tests__/**/*.test.ts`
- Coverage thresholds (enforced in CI): **80% lines / functions / branches / statements**
- Focus on pure functions in `lib/` — data transforms, validation, business rules
- Do not mock the database in tests that exercise DB query logic — use a real test DB

### E2E tests (Playwright)

- Location: `e2e/**/*.spec.ts`
- Multi-project setup: `smoke`, `chromium`, `webkit`, unauthenticated, admin, non-admin
- Auth state is stored via `storageState` — see `playwright.config.ts` for setup projects
- CI runs chromium only; run full suite locally before shipping a UI change
- Always cover: happy path, unauthenticated redirect, and role-based access for new routes

### What to test

- Every new `lib/` utility gets a unit test
- Every new API route gets at minimum a smoke E2E (unauthenticated 401, authenticated 200)
- Every new page route gets an E2E covering the render and primary action

## Error handling

- API routes: return typed JSON `{ error: string }` with correct HTTP status codes; never leak stack traces
- Never swallow errors silently — either re-throw, return a typed error, or log + return a user-safe message
- Use `zod.safeParse` at API boundaries and return `400` on invalid input
- Client-side: catch fetch errors, surface a user-readable message — never `console.error` as the only handling

## Security

- All user-supplied input is validated with Zod before use
- SQL: always use Drizzle's parameterised query builder — no raw string concatenation
- Auth: verify JWT on every protected API route via the `lib/auth` helpers
- Never log PII (email, name, payment data) — use opaque IDs in logs
- Run `pnpm audit` before cutting a release; address any high/critical advisories
- `noDangerouslySetInnerHtml` Biome rule is off for a specific use case — do not add new `dangerouslySetInnerHTML` usages without security review

## Pre-commit hooks

husky + lint-staged run automatically on `git commit`:
- Biome check + auto-fix on staged `ts`, `tsx`, `js`, `jsx`, `json`, `css` files

If the hook fails, fix the issues and re-commit. Do not use `--no-verify` to bypass.

## CI/CD quality gates

All of the following must pass before merge to `main`:

1. `pnpm lint:check` — zero Biome errors
2. `pnpm typecheck` — zero TypeScript errors
3. `pnpm build` — production build succeeds
4. `pnpm test:coverage` — unit tests pass + coverage ≥ 60%
5. `pnpm test:e2e` — all Playwright tests pass (chromium)

Failed CI blocks merge. Do not ship around it.

## PR standards

- Title: conventional commit format — `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
- Include a short description of **why** the change exists, not just what changed
- Link the Paperclip issue identifier (e.g. `SAN-XX`) in the PR description
- Self-review the diff before requesting review — catch obvious mistakes first
- Keep PRs focused; split unrelated changes into separate PRs
- Squash-merge is preferred to keep `main` history clean

## VS Code setup

Install the **Biome** extension (`biomejs.biome`) and add this to your workspace settings to enable format-on-save:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

Recommended extensions: `biomejs.biome`, `bradlc.vscode-tailwindcss`, `ms-playwright.playwright`

## i18n

- All user-facing strings must be in `messages/en.json` and `messages/lt.json`
- Never hardcode UI text in components — always use `useTranslations()` or `getTranslations()`
- Both locale files must be updated in the same commit; do not leave keys missing in one locale
