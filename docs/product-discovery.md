# Product Discovery & Strategy — Santykių Klausimai

> **Last updated:** February 2026
> **Status:** MVP complete (7/10 sprints), pre-monetization
> **URL:** santykiuklausimai.lt

---

## 1. Executive Summary

**Santykių Klausimai** ("Relationship Questions") is a mobile-first progressive web app that transforms meaningful conversation into a Tinder-style card game. Users swipe through curated deep questions — skip, answer, or superlike — interspersed with playful "spicy" challenge cards that add physical and emotional engagement.

### Where We Stand

| Metric | Value |
|--------|-------|
| Total questions | 840+ across 4 audience modes |
| Spicy challenge cards | 166 across 10 card types |
| Languages | 2 (Lithuanian + English) |
| Audiences | 4 (Couples, Family, Friends, Kids) |
| Categories | 15 (12 safe + 3 intimate) |
| Development | 7/10 sprints complete |
| Auth | Google OAuth + email/password |
| Monetization | Not yet launched (Sprint 8) |

### The Opportunity

The relationship wellness app market is projected to reach $5.77B by 2033 (12.5% CAGR). Physical card games for couples are a $15.8B market growing at 8.3% CAGR. We operate at the intersection of both — a digital-first, free-to-start, bilingual product in a Lithuanian market with **zero identified local competitors** and 97% smartphone penetration.

Three remaining sprints stand between the current product and a monetizable launch: payments (Sprint 8), engagement features (Sprint 9), and production hardening (Sprint 10).

---

## 2. Product Overview

### What It Is

A swipe-based conversation card game that replaces surface-level "how was your day" interactions with meaningful questions. Whether it's a date night, family dinner, or friend hangout — the app delivers the right question at the right moment, gamified into a fun swiping experience.

### Who It's For

| Audience | Icon | Questions | Spicy Cards | Content Style |
|----------|------|-----------|-------------|---------------|
| **Couples** | 💜 | 576 | 120 | Romantic, intimate, deep |
| **Family** | 🏠 | 104 | 15 | Wholesome, intergenerational |
| **Friends** | 🎉 | 104 | 16 | Party-style, social |
| **Kids** | 🌈 | 56 | 15 | Silly, safe, age-appropriate |

### Value Proposition

- **For couples:** Go deeper than small talk — build emotional intimacy through curated questions and playful challenges
- **For families:** Bridge generational gaps with conversation starters everyone can enjoy
- **For friends:** Upgrade hangouts from awkward silences to memorable conversations
- **For kids:** Make car rides and family time engaging without screens (ironic, but effective)

### Key Differentiators

- Tinder-like swiping UX (not a boring Q&A list)
- 4 distinct audience modes with curated content
- Spicy challenge cards add physical and emotional engagement
- Bilingual (Lithuanian + English)
- Free to start, no registration required
- Installable PWA with offline support
- Dark theme, mobile-optimized

---

## 3. Core Features & Game Mechanics

### A. Game Loop

```
Select Audience → Pick Categories → Swipe Cards → View Favorites
```

1. **Audience Selection** — 2×2 grid with icons, names, descriptions. Resets progress on switch.
2. **Category Filtering** — 12 safe + 3 intimate categories (intimate hidden for kids). Multi-select with real-time question count.
3. **Card Swiping:**
   - Swipe left = skip (red label, 10ms haptic)
   - Swipe right = answer (purple label, 20ms haptic)
   - Swipe up = superlike / save to favorites (star label, 40ms haptic)
   - 60px distance threshold or 500px/s velocity threshold to trigger
   - Cards rotate ±15° during drag with elastic bounce (0.7)
4. **Spicy Cards** — Random challenge cards injected between questions at configurable probability (5%–50%). All swipe directions dismiss.
5. **Favorites** — Review all superliked questions with previous/next navigation.

### B. Question Categories (15 total)

**Safe (12):** Childhood & Past, Dreams & Future, Fears & Vulnerability, Love & Relationships, Values & Beliefs, Personality & Self-Knowledge, About Us, Existential, Hypothetical, Connection & People, Meaning & Life, Feelings & Inner World

**Intimate (3):** Intimate Questions, Very Intimate Questions, Open Sex Questions — opt-in only, hidden for kids audience

### C. Spicy Card System

10 card types with audience-appropriate content:

| Type | Emoji | Style |
|------|-------|-------|
| Kiss | 💋 | Romantic physical |
| Challenge | 🎯 | Dare-like |
| Compliment | 💝 | Affirmation |
| Massage | 💆 | Relaxation |
| Playful Slap | 👋 | Light-hearted |
| Whisper | 🤫 | Intimate talk |
| Dare | 🔥 | Adventurous |
| Truth | 💭 | Vulnerability |
| Hug | 🤗 | Comfort |
| Dance | 💃 | Physical fun |

**Probability settings:**

| Rarity | Probability | Description |
|--------|-------------|-------------|
| Rare | 5% | Very uncommon |
| Semi-rare | 15% | Uncommon |
| Medium (default) | 30% | Moderate |
| Frequent | 40% | Common |
| Ultra | 50% | Every other card |

### D. Content Volume Breakdown

| Audience | Safe Qs | Intimate Qs | Spicy Cards | Total Items |
|----------|---------|-------------|-------------|-------------|
| Couples | 476 | 100 | 120 | 696 |
| Family | 104 | 0 | 15 | 119 |
| Friends | 104 | 0 | 16 | 120 |
| Kids | 56 | 0 | 15 | 71 |
| **Total** | **740** | **100** | **166** | **1,006** |

### E. Settings & Customization

- Toggle spicy cards on/off
- Frequency selector (5 rarity levels)
- Per-type enable/disable (minimum 1 required)
- Reset all game progress (with confirmation dialog)
- Language switcher (Lithuanian/English)

### F. User Accounts & Progress Sync

- Google OAuth + email/password registration
- Cross-device progress sync via server-side PlayerProgress
- On first login, localStorage progress batch-uploaded to server
- Profile page with stats, logout, account deletion
- JWT auth with 30-day httpOnly cookies

---

## 4. Market Analysis

### 4.1 Total Addressable Markets

The product sits at the intersection of three growing markets:

| Market | 2024 Size | 2033 Projected | CAGR | Source |
|--------|-----------|----------------|------|--------|
| Relationship & Dating Apps | $2.0B | $5.77B | 12.5% | Grand View Research |
| Board & Card Games | $15.8B | $30.9B | 8.3% | Fortune Business Insights |
| Mental Health & Wellness Apps | $7.5B | $17.5B | 14.6% | Allied Market Research |

**Our niche:** Digital relationship wellness — the overlap between dating app engagement mechanics and therapeutic conversation tools. This sub-segment is nascent but accelerating, driven by:

- **Post-pandemic relationship focus:** COVID normalized investing in relationship quality. Couples therapy searches up 300%+ since 2020.
- **Therapy normalization:** Couples therapy stigma declining, especially among millennials and Gen Z. "Relationship wellness" is the new "fitness."
- **Digital intimacy tools:** We're Not Really Strangers proved that deep question cards are a mainstream product ($5-10M/yr revenue), not a therapy niche.
- **TikTok-driven discovery:** Relationship content is among the highest-engagement categories. #couplegoals has 50B+ views. Organic discovery of conversation games through short-form video is a proven acquisition channel.

### 4.2 Lithuanian Market Specifics

| Metric | Value |
|--------|-------|
| Population | 2.85 million |
| Smartphone penetration | 97% |
| Internet penetration | 89.5% |
| E-commerce market size | $3.2B (2024) |
| Average monthly wage | ~€2,100 (gross) |
| Couples (est. cohabiting/married) | ~600K households |
| Median age | 44.6 years |

**Key insight:** Lithuania is a small but digitally mature market. High smartphone penetration and internet usage mean the total addressable audience is effectively the entire adult population. The e-commerce infrastructure supports digital payments.

**Local competition:** **None identified.** No Lithuanian-language relationship question app or digital card game exists. Physical card games are available (imported, English-language), but no local digital product serves this space.

**First-mover advantage:** Being the first and only Lithuanian-language product in this category creates a defensible position through:
- SEO dominance for Lithuanian relationship/conversation keywords
- Brand recognition in a small market
- Content library that's expensive and slow to replicate (840+ curated Lithuanian questions)

### 4.3 Addressable Market Sizing (Lithuania)

```
Total population:                          2,850,000
Adults (18-65):                           ~1,800,000
In relationships (est. 55%):                ~990,000
Smartphone users with app willingness:      ~700,000
Realistically addressable (awareness):      ~200,000–500,000
```

Even conservative awareness penetration (5-10% of addressable) yields 10,000–50,000 potential users — sufficient for a profitable niche product before any international expansion.

---

## 5. Competitive Landscape

### 5.1 Direct Competitors

| Product | Type | Content | Price | Platform | Est. Annual Revenue | Key Strength |
|---------|------|---------|-------|----------|-------------------|--------------|
| **We're Not Really Strangers** | Physical cards + digital | 150+ cards per edition, 3 levels | $25 physical, $4.99 app | Physical + iOS/Android | $5–10M | TikTok virality, brand, 2M+ units sold |
| **Paired App** | Subscription app | Daily questions, courses, quizzes | $6.99/mo ($83.88/yr) | iOS/Android | ~$2.4M (est. 29K subscribers) | Therapist-designed, Apple feature |
| **Vertellis** | Physical cards | 4 editions, ~150 cards each | €20–30 per deck | Physical (NL-based) | ~$4.8M | Family focus, European distribution |
| **The Skin Deep** | Physical cards | 4 decks (relationships, self, family, friends) | $50–90 per bundle | Physical | ~$1–2M | Documentary brand (The And) |
| **TableTopics** | Physical cards | 20+ editions, 135 cards each | $20–30 per pack | Physical (Amazon) | ~$3–5M | Amazon bestseller, 4.7★ rating |
| **Lovify** | Free/premium app | 800+ questions | Free + IAP | iOS/Android | Unknown (new) | Free tier, gamified |
| **Esther Perel's "Where Should We Begin?"** | Physical cards | 280+ cards | $30 | Physical + online | ~$2–3M | Celebrity therapist authority |

### 5.2 Competitive Positioning

```
                    Free ←————————————————————————→ Premium ($80+/yr)
                     │                                    │
     Digital Only    │  ★ Santykių Klausimai              │   Paired App
                     │  Lovify                            │
                     │                                    │
                     │                                    │
     Physical Only   │                  TableTopics       │   WNRS
                     │                  Vertellis         │   Esther Perel
                     │                                    │   The Skin Deep
                     │                                    │
     Multi-audience ─┤────────────────────────────────────┤
                     │                                    │
     Couples-only   ─┤────────────────────────────────────┤
```

### 5.3 Our Competitive Advantages

| Advantage | vs. Physical Cards | vs. Apps |
|-----------|-------------------|----------|
| **Free to start** | Physical cards cost $20-90 upfront | Most apps require subscription from day 1 |
| **Instant access** | No shipping, no waiting | No app store download needed (PWA) |
| **Updatable content** | Physical cards are static | We ship new questions without app updates |
| **Multi-audience** | Most products are couples-only | Paired is couples-only, most apps are single-audience |
| **Lithuanian language** | Almost all competitors are English-only | No competitor offers Lithuanian |
| **Gamified UX** | Cards are sequential, no mechanics | Our swipe + spicy cards + superlikes add engagement |
| **Offline capable** | Physical cards work offline too | Most apps require internet |

### 5.4 Competitive Gaps to Exploit

1. **Lithuanian market is uncontested** — no local competitor in any format
2. **Multi-audience is rare** — most products serve only couples
3. **Free-to-start digital** — physical cards have a $20+ barrier; most apps paywall immediately
4. **Spicy cards are unique** — no competitor mixes conversation questions with physical challenges
5. **PWA distribution** — no app store approval needed, instant access via URL

---

## 6. Monetization Strategy

### 6.1 Freemium Model

| Feature | Free Tier | Premium (€4.99/mo or €29.99/yr) |
|---------|-----------|-------------------------------|
| Questions | 50 (romantic audience only) | All 840+ across all audiences |
| Audiences | Couples only | All 4 (Couples, Family, Friends, Kids) |
| Spicy cards | Disabled | Full access, all 166 cards |
| Categories | 3 safe categories | All 15 (12 safe + 3 intimate) |
| Favorites/Superlikes | 5 max saved | Unlimited |
| Daily question | No | Yes (Sprint 9) |
| Streaks & achievements | No | Yes (Sprint 9) |
| Custom question submissions | No | Yes (Sprint 9) |
| Question packs | No | Yes (Sprint 9) |
| Progress sync | No | Cross-device sync |
| Ads | None (no ads anywhere) | N/A |

**Design principle:** The free tier should be generous enough to demonstrate value but limited enough to create natural upgrade moments. 50 questions across 3 categories is approximately 2-3 good sessions — enough to hook, not enough to satisfy.

### 6.2 Pricing Rationale

| Factor | Consideration |
|--------|--------------|
| Lithuanian purchasing power | Average wage ~€2,100/mo. €4.99/mo = 0.24% of income (comparable to Netflix ratio in Western markets) |
| Competitor pricing | Paired: $6.99/mo ($83.88/yr), WNRS app: $4.99 one-time. Our €29.99/yr is significantly below Paired |
| Annual discount | €29.99/yr = €2.50/mo — 50% savings incentivize commitment |
| Trial period | 7-day free trial on premium (Sprint 8) — reduces friction |
| No ads model | Clean, premium experience even on free tier. Revenue comes from subscriptions, not ads |

### 6.3 Revenue Projections

**Assumptions:**
- Lithuanian addressable market: ~500,000 adults in relationships with smartphones
- Average premium price: ~€5/mo blended (early subscribers skew monthly at €4.99; annual at €2.50/mo equivalent)
- Churn rate: 8-12% monthly (industry standard for subscription apps)

#### Year 1 Projections

| Scenario | Total Users | Free→Premium Conversion | Paying Subscribers | Monthly Revenue | ARR |
|----------|-------------|------------------------|-------------------|----------------|-----|
| **Conservative** | 5,000 | 2% | 100 | ~€500 | ~€6,000 |
| **Moderate** | 20,000 | 4% | 800 | ~€4,000 | ~€48,000 |
| **Optimistic** | 50,000 | 6% | 3,000 | ~€15,000 | ~€180,000 |

#### Year 2+ Projections (with Baltic expansion + English)

| Scenario | Total Users | Paying Subscribers | ARR |
|----------|-------------|-------------------|-----|
| **Moderate growth** | 80,000 | 4,000 | ~€240,000 |
| **Breakout** | 200,000+ | 12,000+ | ~€500,000+ |

### 6.4 Conversion Benchmarks

| Benchmark | Industry Average | Our Target |
|-----------|-----------------|------------|
| Freemium → paid (no trial) | 2–5% | 3% |
| Free trial → paid | 10–25% | 15% |
| Monthly churn (subscription apps) | 6–12% | 8% |
| Annual plan uptake | 30–50% of subscribers | 40% |
| ARPU (avg revenue per user, all users) | €0.30–1.50/mo | €0.50/mo |
| LTV (lifetime value, paying users) | 4–8 months × ARPU | €25–40 |

### 6.5 Additional Revenue Streams

| Stream | Timeline | Potential | Notes |
|--------|----------|-----------|-------|
| **Physical card product** | Year 1–2 | €10–30K/yr | Print-on-demand Lithuanian card deck. Brand extension. Low margin but marketing value. |
| **B2B team-building edition** | Year 2 | €20–50K/yr | "Colleagues" audience with corporate packaging. Sold per-team or per-event. |
| **Content packs (IAP)** | Sprint 9+ | €5–15K/yr | Seasonal/themed question packs (Valentine's, Christmas, New Year). One-time purchase €1.99–3.99. |
| **Affiliate partnerships** | Year 1+ | €2–5K/yr | Date night services, restaurant partnerships, couples retreat recommendations. Lithuanian market. |
| **White-label / API licensing** | Year 2+ | €10–30K/yr | License content to therapists, coaches, event companies. |

### 6.6 Implementation Plan (Sprint 8)

Already scoped in the roadmap:
- Stripe integration (checkout, webhooks, customer portal)
- Paywall component with upgrade prompts at natural friction points
- 7-day free trial flow
- Subscription management (upgrade, downgrade, cancel)
- Webhook handling for payment events
- Premium feature gating throughout the app

---

## 7. Growth & User Acquisition Strategy

### 7.1 Phase 1 — Lithuanian Launch (Months 1–6)

**Goal:** 5,000–20,000 users, establish brand in Lithuanian market

| Channel | Tactic | Expected CAC | Priority |
|---------|--------|-------------|----------|
| **TikTok UGC** | Short videos of couples playing the game, reading spicy cards, reacting to questions. Proven by WNRS ($5-10M built on TikTok virality). | €0–0.50 | 🔴 Critical |
| **Instagram Reels** | Same content cross-posted. Carousel posts with "Top 10 questions for date night." | €0.50–1.00 | 🔴 Critical |
| **Lithuanian influencer couples** | 5-10 micro-influencers (5K-50K followers). Gifted access + affiliate commission. | €1–3 | 🟡 High |
| **SEO (already optimized)** | Sprint 6 delivered JSON-LD, sitemap, Core Web Vitals, hreflang. Target: "klausimai poroms", "santykių žaidimas", "klausimai šeimai". | €0 (organic) | 🟢 Ongoing |
| **Lithuanian media/PR** | Pitch to lifestyle publications: "Lithuanian couple creates digital card game." Story angle: local tech + relationships. | €0 | 🟡 High |
| **Facebook groups** | Lithuanian parenting groups, couples communities, family activity groups. Organic sharing. | €0 | 🟢 Low effort |

### 7.2 Phase 2 — Organic Growth Engine (Months 3–12)

**Goal:** Build retention and viral loops

| Mechanic | Sprint | Impact |
|----------|--------|--------|
| **Social sharing** | 9 | Dynamic OG images for shared questions. "I superliked this question" share cards for Instagram stories. |
| **Streaks** | 9 | Daily question streak mechanic drives DAU. Lose streak = re-engagement notification. |
| **Daily question** | 9 | Single question push/notification per day. Low commitment, high retention. |
| **Achievements** | 9 | 15+ badges for milestones (100 questions answered, 7-day streak, all categories tried). Shareable. |
| **Custom question submissions** | 9 | Community-generated content. Users invest in the product → higher retention. |
| **Word of mouth** | Ongoing | Couples recommend to friends. Game is inherently social — played together. |

### 7.3 Phase 3 — Baltic Expansion (Year 1–2)

**Goal:** 50,000+ users across Baltic states

| Market | Population | Language | Strategy |
|--------|-----------|----------|----------|
| **Estonia** | 1.3M | Estonian | Translate UI + 200 core questions. Similar cultural context. |
| **Latvia** | 1.9M | Latvian | Translate UI + 200 core questions. Largest Baltic neighbor. |

**Why Baltic first:**
- Shared cultural context (post-Soviet, European, similar relationship norms)
- Small enough to test localization process before major languages
- Combined Baltic market: 6M people (2× Lithuania alone)
- EU payments infrastructure already works

### 7.4 Phase 4 — International (Year 2+)

**Goal:** English market entry, European expansion

| Priority | Market | Rationale |
|----------|--------|-----------|
| 1 | **English (global)** | Already supported in UI. Need English question content. Massive market (1B+ English speakers). |
| 2 | **Polish** | 38M population, cultural proximity, large diaspora in Lithuania. |
| 3 | **German** | 83M population, high app spending, strong couples culture. |
| 4 | **Spanish** | 500M+ speakers, huge mobile market, passionate relationship culture. |

### 7.5 Channel Economics

| Channel | Est. CAC | Scalability | Timeline |
|---------|---------|-------------|----------|
| Organic SEO | €0 | Medium (limited search volume) | Already live |
| TikTok UGC (organic) | €0–0.50 | High (viral potential) | Month 1 |
| Instagram Reels | €0.50–1.00 | Medium | Month 1 |
| Influencer partnerships | €1–3 | Medium (local market) | Month 2 |
| Google Ads (branded) | €0.50–2.00 | Low-Medium | Month 3 |
| Facebook/Instagram Ads | €2–5 | High | Month 4 |
| App Store (if native wrapper) | €1–3 | High | Month 6+ |
| Word of mouth | €0 | Slow but compounding | Ongoing |

**Target blended CAC:** €1–2 (Lithuanian market), €3–5 (international)
**Target LTV:CAC ratio:** 5:1+

---

## 8. Success Scenarios

### 8.1 Conservative — "Sustainable Side Project" (Year 1)

| Metric | Target |
|--------|--------|
| Total users | 5,000 |
| Monthly active users | 1,500 |
| Premium conversion | 2% |
| Paying subscribers | 100 |
| ARR | ~€6,000 |
| Monthly costs | ~€50 (hosting + domain) |

**Triggers:** Organic SEO drives steady trickle. Word of mouth in Lithuanian couples community. No significant marketing spend.

**Outcome:** Profitable from month 1 (costs are minimal). Validates product-market fit. Provides data for scaling decisions.

### 8.2 Moderate — "Real Business" (Year 1)

| Metric | Target |
|--------|--------|
| Total users | 20,000 |
| Monthly active users | 6,000 |
| Premium conversion | 4% |
| Paying subscribers | 800 |
| ARR | ~€48,000 |
| Monthly costs | ~€200 (hosting + tools) |

**Triggers:** Successful TikTok content strategy. 2-3 viral videos. Lithuanian media coverage. Influencer partnerships convert.

**Outcome:** Enough revenue to fund part-time focus. Justifies investment in Baltic expansion. Clear product-market fit with retention data.

**Key milestones:**
- 1,000 users within 30 days of launch
- 3% conversion within 60 days
- 15-minute average session duration
- 30%+ 7-day retention rate

### 8.3 Optimistic — "Growth Mode" (Year 1)

| Metric | Target |
|--------|--------|
| Total users | 50,000 |
| Monthly active users | 15,000 |
| Premium conversion | 6% |
| Paying subscribers | 3,000 |
| ARR | ~€180,000 |
| Monthly costs | ~€500 (hosting + marketing budget) |

**Triggers:** Multiple viral TikTok moments. Lithuanian cultural moment (e.g., Valentine's Day campaign goes viral). Press coverage. Strong word-of-mouth in the small Lithuanian market creates network effect.

**Outcome:** Full-time viable. Fund team expansion. Accelerate Baltic and English launches.

### 8.4 Breakout — "Market Leader" (Year 2+)

| Metric | Target |
|--------|--------|
| Total users | 200,000+ |
| Markets | Lithuania + Estonia + Latvia + English |
| Paying subscribers | 12,000+ |
| ARR | €500,000+ |
| Physical card product | Launched, contributing €30K+ |
| B2B edition | Pilot customers |

**Triggers:** Successful Baltic expansion. English content quality matches Lithuanian. Physical card product creates retail presence. B2B team-building edition opens corporate market.

**Outcome:** Category-defining product in the Baltics. Investment-ready for European expansion. Multiple revenue streams de-risk the business.

---

## 9. Scaling Strategy

### 9.1 Content Scaling

| Strategy | Timeline | Mechanism |
|----------|----------|-----------|
| **Community submissions** | Sprint 9 | Users submit questions → admin review → publish. Scales content without internal writing. |
| **AI-assisted generation** | Year 1 | Use LLMs to generate question drafts per category/audience. Human curation for quality. |
| **Seasonal/themed packs** | Sprint 9+ | Valentine's Day (already have 30 questions), Christmas, New Year, Summer. Drives re-engagement. |
| **Expert partnerships** | Year 2 | Collaborate with therapists and relationship coaches for premium question packs. Authority + content. |
| **User-voted quality** | Year 2 | Skip rate per question = quality signal. Auto-demote low-quality questions. Surface highest-rated. |

### 9.2 Market Scaling

| Phase | Markets | Languages | Timeline | Approach |
|-------|---------|-----------|----------|----------|
| **Current** | Lithuania | LT, EN (UI only) | Now | Full product, all features |
| **Baltic** | + Estonia, Latvia | + ET, LV | Year 1–2 | Translate UI + 200 core questions per language |
| **Central European** | + Poland | + PL | Year 2 | Full content library, local influencer strategy |
| **Western European** | + Germany, Spain, France | + DE, ES, FR | Year 2–3 | Localized content, market-specific pricing |
| **Global** | English-speaking markets | EN (full content) | Year 2 | Complete English question library (840+) |

**Localization playbook per new market:**
1. Translate UI strings (~100 translation keys)
2. Translate/adapt 200 core questions (couples audience first)
3. Recruit 3-5 local micro-influencers
4. Localize SEO (meta tags, sitemap, keywords)
5. Adjust pricing to local purchasing power
6. Monitor and iterate based on skip rates and session data

### 9.3 Product Scaling

| Extension | Timeline | Investment | Revenue Potential |
|-----------|----------|------------|-------------------|
| **Native app wrapper** | Year 1 | Low (Capacitor/Expo wrapping existing PWA) | Enables push notifications, App Store presence, higher conversion |
| **Physical card deck** | Year 1 | Medium (€2-5K for design + initial print run) | €10-30K/yr. Marketing tool + revenue. Print-on-demand for low risk. |
| **B2B team-building edition** | Year 2 | Medium (new "Colleagues" audience + corporate landing page) | €20-50K/yr. Per-team licensing or event-based pricing. |
| **Therapist/coach toolkit** | Year 2+ | Low (API access + branded cards) | €10-30K/yr. White-label or affiliate model. |
| **Multiplayer mode** | Year 2 | High (real-time sync, room codes) | Engagement driver, not direct revenue. Group play for friends/family. |

### 9.4 Technical Scaling

The current architecture supports significant growth before requiring changes:

| Component | Current | Scales To | When to Upgrade |
|-----------|---------|-----------|-----------------|
| **Database** | PostgreSQL (single) | ~100K users, ~1M progress records | Add read replica at 50K+ daily active |
| **Server** | Next.js on single instance | ~5K concurrent users | Add CDN + serverless edge at 10K+ concurrent |
| **CMS** | PayloadCMS (same server) | Fine for content management | Separate CMS from app server if admin load is high |
| **Assets** | Next.js static serving | Fine for current scale | Add CDN (Cloudflare/Vercel Edge) at 10K+ DAU |
| **Analytics** | Custom batch pipeline to PostgreSQL | ~1M events/day | Consider TimescaleDB or ClickHouse at 10M+ events |
| **Auth** | PayloadCMS JWT | Fine at any scale | No change needed |

**Key architectural advantage:** The app is stateless (localStorage + server sync). This means horizontal scaling is straightforward — just add servers behind a load balancer. No sticky sessions, no complex state management.

---

## 10. Technical Architecture

### Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.5 |
| Language | TypeScript | 5.3 |
| UI | React | 19.2 |
| Styling | Tailwind CSS | 3.4 |
| Animation | Framer Motion | 12.34 |
| i18n | next-intl | 4.8 |
| CMS | PayloadCMS | 3.77 |
| Database | PostgreSQL | 16 |
| PWA | @ducanh2912/next-pwa | 10.2 |

### Data Model (PayloadCMS Collections)

**Content collections (CMS-managed):**
- `Questions` — text, category (relation), locale, audience, status (draft/published), legacyId
- `Categories` — name, type (safe/intimate), sortOrder, locale
- `SpicyCards` — title, description, cardType (relation), locale, audience, status
- `SpicyCardTypes` — slug, label, icon, color, locale
- `Audiences` — slug, name, description, icon, color, isActive, sortOrder

**User collections:**
- `Users` — admin accounts (Payload auth)
- `Players` — game players (email/Google/Apple auth), preferences, spicy settings
- `PlayerProgress` — per-question status per player (answered/skipped/superliked)

**Analytics collections:**
- `GameSessions` — sessionId, timestamps, audience, locale, counters, duration, device
- `QuestionEvents` — sessionId, questionId, eventType, timestamp, timeSpent

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/game-data?audience=X&locale=X` | Fetch questions + spicy cards |
| `POST /api/analytics` | Batch event ingestion |
| `POST /api/progress` | Sync player progress (authenticated) |
| `POST /api/auth/google` | Google OAuth flow |

### Analytics Pipeline

- Client-side `AnalyticsBuffer` queues events in memory
- Auto-flushes every 10s, on tab hide (`visibilitychange`), and on close (`beforeunload`)
- Uses `navigator.sendBeacon` for reliable delivery
- Anonymous tracking (no auth required)

---

## 11. Roadmap & Execution

### Completed (Sprints 1–7)

| Sprint | Scope | Status |
|--------|-------|--------|
| 1 | PayloadCMS setup, 576 questions seeded | ✅ Done |
| 2 | Analytics pipeline, session tracking, admin dashboard | ✅ Done |
| 3 | 4 audiences, 264 new questions/cards, kids safety filtering | ✅ Done |
| 4 | Design system (13 components, tokens, animations) | ✅ Done |
| 5 | Internationalization (lt + en), landing page redesign | ✅ Done |
| 6 | SEO optimization, JSON-LD, sitemap, Core Web Vitals | ✅ Done |
| 7 | User accounts, Google OAuth, progress sync | ✅ Done |

### Upcoming (Sprints 8–10)

| Sprint | Scope | Dependencies | Priority |
|--------|-------|-------------|----------|
| **8 — Stripe Payments** | Freemium model, Stripe checkout, webhooks, paywall, 7-day trial | Sprint 7 | 🔴 Critical — must ship before launch |
| **9 — Engagement Features** | Daily question, question packs, social sharing, streaks, achievements (15+ badges), custom submissions, local multiplayer | Sprint 8 | 🟡 High — drives retention + virality |
| **10 — Production Launch** | Performance optimization, security hardening, Sentry monitoring, load testing, CI/CD, go-live | Sprint 9 | 🔴 Critical — gates revenue |

### Critical Path

```
Sprint 8 (Payments)
    ↓
Sprint 9 (Engagement)
    ↓
Sprint 10 (Launch Hardening)
    ↓
🚀 Public Launch
    ↓
Phase 1: Lithuanian market (TikTok, influencers, SEO)
    ↓
Phase 2: Organic growth (sharing, streaks, daily question)
    ↓
Phase 3: Baltic expansion (Estonian + Latvian)
    ↓
Phase 4: International (English full content, European languages)
```

### Priority Recommendation

**Monetization before advanced features.** Sprint 8 (payments) is the highest-leverage remaining work. Every day of user acquisition without a payment flow is potential revenue left on the table. Sprint 9 features (streaks, sharing) amplify a monetized product — they don't replace monetization.

Recommended sequence:
1. Sprint 8 → enable revenue
2. Launch with minimal Sprint 9 features (daily question + sharing)
3. Sprint 10 → production hardening
4. Remaining Sprint 9 features → post-launch iteration based on data

---

## 12. Risks & Mitigations

### Product & Market Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **Small Lithuanian market limits growth** | High | High | Baltic expansion plan (Phase 3). English market entry (Phase 4). Lithuania is proving ground, not ceiling. |
| **Physical card competitors have brand advantage** | Medium | Medium | Digital advantages: free-to-start, instant access, updatable content, multi-audience. Physical cards can't match our engagement mechanics or accessibility. |
| **Low premium conversion rate** | High | Medium | Optimize free tier frustration points. A/B test paywall placement. 7-day trial reduces friction. Question-level analytics identify best "hook" content for free tier. |
| **Content fatigue (users exhaust questions)** | Medium | Medium | Community submissions (Sprint 9). AI-assisted generation. Seasonal packs. 840+ questions = ~28 sessions at 30 questions/session — substantial runway. |
| **TikTok algorithm changes** | Medium | Medium | Diversify acquisition channels. SEO provides baseline. Build email list for owned audience. Instagram and Facebook as secondary channels. |

### Technical Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **PWA limitations on iOS** | Medium | High | Core features work in browser fallback. Consider native wrapper via Capacitor/Expo (Year 1). Push notifications via web push where supported. |
| **Stripe payment failures in Lithuanian market** | Low | Low | Stripe supports Lithuanian cards and banks. SEPA as backup. Apple Pay/Google Pay for frictionless checkout. |
| **Scale issues under load** | Low | Low | Current architecture handles 5K+ concurrent easily. Stateless design means horizontal scaling is trivial. PostgreSQL handles millions of rows. |
| **Content moderation (community submissions)** | Medium | Medium | Admin review queue in PayloadCMS. Draft/published workflow already exists. Report mechanism for inappropriate content. |
| **Data privacy / GDPR compliance** | High | Medium | Minimal data collection. Anonymous analytics. Account deletion flow already implemented. Need privacy policy + cookie consent before launch. |

### Business Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **Solo developer bottleneck** | Medium | High | Modular architecture allows parallel work. CMS-based content management doesn't require developer intervention. Prioritize Sprint 8 (payments) as single most impactful feature. |
| **Competitor enters Lithuanian market** | Low | Low | First-mover advantage + 840+ curated questions = 6+ months head start. SEO dominance already established. Brand recognition in small market compounds. |
| **Subscription fatigue** | Medium | Medium | Generous free tier keeps users engaged. One-time purchase options (question packs) for users who won't subscribe. Physical card product as non-subscription revenue. |

---

## 13. Key Metrics & KPIs

### Acquisition Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **MAU** | Monthly active users | 5K+ (Year 1) | Unique sessions/month |
| **DAU** | Daily active users | 500+ (Year 1) | Unique sessions/day |
| **New user rate** | New users per week | 200+ | First-time sessions |
| **Install rate** | PWA installs / total visits | >5% | Service worker registration |
| **CAC** | Cost to acquire one user | <€2 (Lithuanian) | Marketing spend / new users |
| **Channel attribution** | Users by acquisition source | N/A | UTM tracking + referrer analysis |

### Engagement Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **Session duration** | Average time per session | >5 minutes | GameSessions.duration |
| **Questions per session** | Cards swiped per session | >15 | GameSessions.questionsViewed |
| **Superlike rate** | % of viewed questions superliked | >10% | QuestionEvents ratio |
| **Spicy card interaction** | % of spicy cards engaged with | >70% | SpicyCard dismiss events |
| **Streak length** | Average consecutive daily sessions | >3 days (Sprint 9) | PlayerProgress streaks |
| **7-day retention** | % of users returning within 7 days | >30% | Session tracking |
| **30-day retention** | % of users returning within 30 days | >15% | Session tracking |
| **Audience distribution** | Users per audience mode | Couples >50% | GameSessions.audience |

### Monetization Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **Conversion rate** | Free → premium | >3% | Stripe subscriptions / total users |
| **Trial → paid** | 7-day trial completion | >15% | Stripe trial conversions |
| **MRR** | Monthly recurring revenue | €4K+ (Moderate Y1) | Stripe dashboard |
| **ARR** | Annual recurring revenue | €48K+ (Moderate Y1) | MRR × 12 |
| **ARPU** | Avg revenue per user (all users) | >€0.50/mo | MRR / MAU |
| **LTV** | Lifetime value (paying users) | >€25 | ARPU / churn rate |
| **Churn rate** | Monthly subscriber cancellations | <10% | Stripe cancellations / active subs |
| **LTV:CAC ratio** | Return on acquisition investment | >5:1 | LTV / CAC |

### Content Quality Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **Skip rate per question** | % of times a specific question is skipped | <40% (quality signal) | QuestionEvents analysis |
| **Superlike rate per question** | % of times a specific question is superliked | Top 10% identified | QuestionEvents analysis |
| **Category popularity** | Sessions per category | Balanced distribution | Category selection tracking |
| **Content exhaustion rate** | % of users who run out of questions | <5% per month | PlayerProgress analysis |
| **Community submission rate** | User-submitted questions per week | 10+ (Sprint 9) | CMS submission queue |

### Language & Market Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **Language split** | Sessions by locale | LT >80% (primary market) | GameSessions.locale |
| **Market penetration** | Users / addressable market | >1% (Lithuania Y1) | Registration data |
| **SEO rankings** | Position for target keywords | Top 3 for Lithuanian keywords | Search Console |
| **Organic traffic share** | % of users from search | >30% | Analytics referrer data |
