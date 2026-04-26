# Santykių Klausimai

Relationship question card game for couples, families, and friends — a mobile-first web app in Lithuanian and English.

## Tech Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS** + **Framer Motion**
- **PostgreSQL** + **Drizzle ORM**
- **Google OAuth** + **JWT** auth
- **Stripe** payments
- **next-intl** (Lithuanian + English)
- **Vitest** (unit) + **Playwright** (E2E)

---

## Local Development Setup

### Prerequisites

- **Node.js 20+** and **pnpm**
- **Docker** (for local PostgreSQL)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL 16 on port **5433** with credentials `payload:payload` and database `santykiuklausimai`.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Already set to local Docker URL — no change needed |
| `STRIPE_SECRET_KEY` | [Stripe dashboard](https://dashboard.stripe.com/test/apikeys) — use **test** keys |
| `STRIPE_PUBLISHABLE_KEY` | Same Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | Run `stripe listen --forward-to localhost:7743/api/stripe/webhook` |
| `STRIPE_MONTHLY_PRICE_ID` | Create test prices in Stripe or copy from test environment |
| `STRIPE_YEARLY_PRICE_ID` | Same as above |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com/) — OAuth 2.0 credentials |
| `GOOGLE_CLIENT_SECRET` | Same Google Cloud Console project |
| `GOOGLE_REDIRECT_URI` | Use `http://localhost:7743/api/auth/google/callback` for local dev |
| `NEXT_PUBLIC_URL` | Already set to `http://localhost:7743` — no change needed |

### 4. Run migrations

```bash
pnpm db:migrate
```

Applies all pending Drizzle migrations from `drizzle/migrations/`.

### 5. Seed the database (optional)

```bash
pnpm seed
```

Loads all question content (840+ questions, spicy cards, audiences).

### 6. Start the dev server

```bash
pnpm dev
```

App runs at **http://localhost:7743**.

---

## Development Commands

```bash
pnpm dev            # Start dev server on :7743
pnpm build          # Production build
pnpm typecheck      # TypeScript check (no emit)
pnpm lint           # Biome check + auto-fix
pnpm lint:check     # Biome check only (CI mode)

# Database
pnpm db:migrate     # Run Drizzle migrations
pnpm db:push        # Push schema without migration files (dev only)
pnpm db:studio      # Open Drizzle Studio GUI
pnpm seed           # Seed all question content

# Testing
pnpm test           # Vitest unit tests
pnpm test:coverage  # Vitest with coverage report
pnpm test:e2e       # Playwright E2E (all browsers)
pnpm test:watch     # Vitest watch mode
pnpm smoke          # Playwright smoke tests only (CI-ready)
```

---

## Running E2E Tests Locally

E2E tests use Playwright against a live dev server. Playwright auto-starts the dev server if it isn't already running.

```bash
# Full E2E suite (chromium + webkit)
pnpm test:e2e

# With interactive UI
pnpm test:e2e:ui

# Specific project
pnpm test:e2e --project=chromium
pnpm test:e2e --project=unauthenticated
```

**Auth setup:** E2E tests use stored auth state. The `setup` and `admin-setup` projects run first and write cookie state to `e2e/.auth/`. Make sure your local database is seeded with at least one user account matching the test credentials.

**Note:** CI runs chromium only. Run the full suite locally before shipping a UI change.

---

## Project Structure

```
app/[locale]/          # Next.js App Router pages (i18n via next-intl)
app/api/               # API route handlers
components/            # Shared React components
lib/                   # Pure business logic, utilities, DB queries
  __tests__/           # Unit tests (Vitest)
messages/              # i18n translation files (en.json, lt.json)
scripts/               # One-off CLI scripts
drizzle/
  migrations/          # SQL migration files
  schema/              # Drizzle schema definitions
e2e/                   # Playwright E2E tests
public/                # Static assets
```

---

## CI Quality Gates

All of the following must pass before merging to `main`:

1. `pnpm lint:check` — zero Biome errors
2. `pnpm typecheck` — zero TypeScript errors
3. `pnpm build` — production build succeeds
4. `pnpm test:coverage` — unit tests pass + coverage ≥ 60%
5. `pnpm test:e2e` — all Playwright tests pass (chromium)

---

## i18n

User-facing strings live in `messages/en.json` and `messages/lt.json`. Both files must be updated together — never leave a key missing in one locale.
