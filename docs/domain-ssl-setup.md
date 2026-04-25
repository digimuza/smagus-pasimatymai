# Domain & SSL Setup — santykiuklausimai.lt

Operator runbook for SAN-29. Execute after Coolify + Hetzner VPS are running (SAN-28).

## Prerequisites

- Hetzner VPS provisioned, Coolify installed, app running on the server IP
- Access to DNS registrar for `santykiuklausimai.lt`
- Access to the Coolify dashboard

---

## Step 1 — DNS Configuration

At your DNS registrar, create these records:

| Type  | Name  | Value                  | TTL  |
|-------|-------|------------------------|------|
| A     | `@`   | `<Hetzner VPS IP>`     | 300  |
| A     | `www` | `<Hetzner VPS IP>`     | 300  |

TTL 300 (5 min) during initial setup. Raise to 3600 once verified.

> The `www` redirect to apex (`santykiuklausimai.lt`) is handled at the Next.js level
> (`next.config.mjs` `redirects()`), so both records pointing to the same IP is correct.

---

## Step 2 — Coolify Domain + SSL

In the Coolify dashboard for the app resource:

1. **Settings → Domains** — add `santykiuklausimai.lt` and `www.santykiuklausimai.lt`
2. **SSL** — enable "Let's Encrypt" (Traefik obtains cert automatically on first request)
3. **Force HTTPS** — enable the "Redirect HTTP to HTTPS" toggle
4. Redeploy the service so Traefik picks up the new domain configuration

Traefik will request a TLS certificate from Let's Encrypt using HTTP-01 challenge on port 80.
Ensure port 80 is open on the Hetzner firewall rule (needed for the ACME challenge).

### Required firewall ports

| Port | Protocol | Purpose                        |
|------|----------|-------------------------------|
| 80   | TCP      | HTTP + Let's Encrypt ACME     |
| 443  | TCP      | HTTPS                         |
| 8000 | TCP      | Coolify dashboard (optional)  |

---

## Step 3 — Coolify Environment Variables

In Coolify → app → Environment Variables, set production values:

```
NEXT_PUBLIC_URL=https://santykiuklausimai.lt
GOOGLE_REDIRECT_URI=https://santykiuklausimai.lt/api/auth/google/callback
```

All other vars are documented in `.env.example`.

---

## Step 4 — Google OAuth Redirect URI

In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials:

- Open the OAuth 2.0 Client ID used by the app
- Add `https://santykiuklausimai.lt/api/auth/google/callback` to **Authorised redirect URIs**

---

## Step 5 — Verify

```bash
# DNS propagation (run from outside the server)
dig +short santykiuklausimai.lt A
dig +short www.santykiuklausimai.lt A

# HTTPS + certificate
curl -I https://santykiuklausimai.lt/api/health

# HTTP → HTTPS redirect
curl -I http://santykiuklausimai.lt/api/health
# Expect: HTTP/1.1 301 or 308 with Location: https://...

# www → apex redirect (handled by Next.js)
curl -I https://www.santykiuklausimai.lt/
# Expect: HTTP/1.1 308 Permanent Redirect to https://santykiuklausimai.lt/

# HSTS header present
curl -sI https://santykiuklausimai.lt/ | grep -i strict-transport
# Expect: strict-transport-security: max-age=63072000; includeSubDomains; preload
```

---

## Stripe Webhook Update

After domain is live, update the Stripe webhook endpoint in the Stripe dashboard:

- Old: any test endpoint
- New: `https://santykiuklausimai.lt/api/stripe/webhook`

Update `STRIPE_WEBHOOK_SECRET` in Coolify env vars with the new signing secret.
