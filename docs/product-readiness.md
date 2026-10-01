# Product readiness audit

Updated 2026-09-28. This records what is implemented and what must be supplied before a public paid launch.

| Area | Current state | Next operational step |
| --- | --- | --- |
| Conversation game | Couples, family, friends, and kids modes, categories, progress, favorites, and challenge cards are implemented. Visible buttons support play without gestures. | Review and expand the curated question library based on user feedback. |
| Languages | Lithuanian has the full library. English has starter decks: 30 couples questions and 15 questions in each other mode. | Translate and edit the full English library before marketing it as equivalent to Lithuanian. |
| Accounts | Email/password and Google OAuth routes exist. Anonymous couples play works without an account. | Configure Google credentials and verify the provider flow against a real OAuth project. |
| Payments | Stripe checkout, portal, webhooks, and premium gating are implemented. | Supply live Stripe keys and price IDs; exercise checkout, cancellation, and webhook retries in Stripe test mode before enabling live billing. |
| Setup | pnpm, PostgreSQL Compose, example environment variables, and an idempotent seed are documented. Admin creation requires explicit credentials. | Set deployment secrets and provision a persistent PostgreSQL database. |
| CI | GitHub Actions runs lint, TypeScript, unit tests, build, seeded database, Chromium flows, and a Docker container smoke test. Passing pushes to `main` and `v*` tags publish the image to GHCR. | Set the repository `APP_URL` variable and require the CI workflow on protected branches. Add browser coverage for a configured Stripe sandbox. |
| Deployment | A non-root Docker image, GHCR publishing workflow, Vercel configuration, and database readiness endpoint are present. | Provision persistent PostgreSQL, seed production content, set runtime secrets and the public URL, configure the custom domain and Stripe webhook, and verify the deployed build. A hosting target is still needed for automatic server deployment. |
| PWA | Manifest, service worker, favicon, and install icons are present. | Test installation and offline behavior on actual iOS and Android devices. |

## Local verification

Use the commands in [README.md](../README.md). The browser suite requires a seeded database. `GET /api/health` reports database readiness; it does not depend on the Stripe API.

## Remaining product risks

- English content is a starter edition. Premium English users currently get a smaller library than Lithuanian users.
- The app has payment and OAuth code, but real provider flows require external credentials and a reachable callback URL.
- Privacy and terms pages are present. A human owner should review their wording and actual data practices before launch.
