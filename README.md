# Santykių Klausimai

A conversation card game for couples, families, friends, and kids. The app is built with Next.js 15, Payload CMS, PostgreSQL, and next-intl. Lithuanian has the full question library; English has curated starter decks: 30 couples questions and 15 each for family, friends, and kids.

## Local setup

Requirements: Node.js 20, pnpm 10, Docker, and a Chromium browser for end-to-end tests.

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
# Edit .env.local: set a unique PAYLOAD_SECRET and the database URL
docker compose up -d
pnpm seed
pnpm dev
```

Open <http://localhost:7743>. The database uses port 5433 by default. If that port is busy, run `POSTGRES_PORT=5434 docker compose up -d` and change the port in `DATABASE_URL` in `.env.local` to 5434.

`PAYLOAD_SECRET` must be unique and at least 32 characters. Seeding does not create an admin account by default. To create one, set `SEED_ADMIN_EMAIL` and a unique `SEED_ADMIN_PASSWORD` of at least 12 characters before running `pnpm seed`. The seed is safe to rerun.

Google sign-in requires Google OAuth credentials. Checkout requires Stripe keys, price IDs, and a webhook secret. Without those integrations, the conversation game still works; checkout and Google sign-in are unavailable. Never use the sample values in production.

## Quality checks

```bash
pnpm lint:check
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

End-to-end tests require a seeded PostgreSQL database and a running app. Playwright starts `pnpm dev` automatically when nothing is listening on port 7743. CI builds and seeds its own database, then runs the same tests against `pnpm start`.

## Docker deployment

Build the same image that GitHub Actions publishes. Set the public URL at build time because Next.js generates page metadata and client assets during the build:

```bash
docker build --build-arg NEXT_PUBLIC_URL=https://your-domain.example \
  -t santykiu-klausimai:local .
```

Provision persistent PostgreSQL 16 and seed its content once from a checkout of this repository:

```bash
DATABASE_URL='postgresql://user:password@db-host:5432/database' \
PAYLOAD_SECRET='your-unique-secret-at-least-32-characters' pnpm seed
```

Create a private runtime environment file with `DATABASE_URL`, a unique `PAYLOAD_SECRET`, and `NEXT_PUBLIC_URL` set to the same HTTPS URL used at build time. Add Stripe and Google values only when enabling those integrations. The image does not contain the local environment file or credentials.

```bash
docker run -d --name santykiu-klausimai --restart unless-stopped \
  --env-file .env.production -p 7743:7743 santykiu-klausimai:local
curl --fail http://localhost:7743/api/health
```

Put the container behind an HTTPS reverse proxy. `/api/health` checks database readiness and is also the image health check. Keep PostgreSQL storage persistent, back it up, and configure the Stripe webhook as `https://your-domain.example/api/webhooks/stripe` if payments are enabled. Rebuild the image when the public domain changes. The repository still includes a Vercel configuration if you choose that platform.

### Production deployment

The production app is `pasimatymai` in Coolify's **Digimuza AI / production** environment at <https://pasimatymai.digimuza.ai>. It pulls `docker.digimuza.ai/pasimatymai:latest` and uses its own private PostgreSQL 16 database, `pasimatymai-postgres`. Coolify stores `DATABASE_URL`, `PAYLOAD_SECRET`, and `NEXT_PUBLIC_URL` as app environment variables. The database has a daily local backup with seven-day retention.

Pull requests run lint, type checks, unit tests, a production build, browser tests, and a Docker image smoke test. After those jobs pass, pushes to `main` publish `latest` and `sha-...` tags to `docker.digimuza.ai/pasimatymai`, trigger the Coolify deployment, and check `/api/health`. Tags matching `v*` publish a release tag and SHA tag without deploying. The build uses `https://pasimatymai.digimuza.ai` for generated metadata.

GitHub Actions needs repository secrets `REGISTRY_USERNAME`, `REGISTRY_PASSWORD`, and `COOLIFY_TOKEN`. The registry credentials come from the Coolify `docker` registry service; the token needs permission to deploy the app. The app UUID in the workflow is `xmz4o79mozm02bj7ntmee7fv`. Seed the database once with `pnpm seed` from a checkout that can reach the private database. Keep the database private and monitor the backup schedule and CI deployment job.

The PWA manifest and icons are in `public/`.
