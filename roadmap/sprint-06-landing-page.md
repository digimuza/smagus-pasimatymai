# Sprint 6: Landing Page Rebuild

**Status:** Complete
**Depends on:** Sprint 5
**Blocks:** Sprint 9

## Goal

Polish the marketing landing page for SEO, accessibility, and Core Web Vitals. The landing page was structurally built during Sprint 5 (i18n); this sprint adds the remaining sections, SEO metadata, and performance optimizations.

## What Was Done

### Landing Page Sections (built in Sprint 5, enhanced here)
- [x] **Hero** — animated title with shimmer gradient, heartbeat CTA, floating heart on hover
- [x] **Mode Showcase** — 3 audience cards (couples, family, friends) with hover glow effects
- [x] **How It Works** — 3 numbered steps with staggered scroll animations
- [x] **Features Grid** — 3 stat cards (questions, spicy cards, categories)
- [x] **Social Proof** — testimonial with star rating
- [x] **FAQ** — accordion with AnimatePresence expand/collapse, keyboard accessible
- [x] **Bottom CTA** — gradient button linking to audience selector
- [x] **Navigation** — logo + language switcher
- [x] **Footer** — copyright, privacy/terms links

### SEO Optimization
- [x] `generateMetadata()` with localized title, description, Open Graph tags per locale
- [x] JSON-LD structured data (`WebApplication` schema with aggregate rating)
- [x] `app/sitemap.ts` — generates sitemap for lt + en locale routes
- [x] `app/robots.ts` — blocks `/admin` and `/api/`, points to sitemap
- [x] Canonical URLs and `alternates.languages` for lt/en

### Core Web Vitals Optimization
- [x] `content-visibility: auto` on below-fold sections (HowItWorks, FeaturesGrid, SocialProof, FAQ, BottomCTA)
- [x] FloatingParticles: reduced to 8 particles, simplified animations (y-only), `will-change-transform`
- [x] `useReducedMotion` support — particles hidden when user prefers reduced motion
- [x] `aria-hidden="true"` on decorative particles
- [x] CSS keyframe animations (shimmer, heartbeat) instead of JS-driven alternatives

### Content (i18n message files)
- [x] Full Lithuanian landing page copy in `messages/lt.json`
- [x] Full English landing page copy in `messages/en.json`
- [x] FAQ items (5 Q&A pairs per locale)

## Design Decision

Original plan called for a PayloadCMS Global for landing page content. Instead, landing page copy lives in next-intl message files (`messages/lt.json`, `messages/en.json`). This is simpler, faster (static rendering), and sufficient since landing page copy changes infrequently. CMS-managed landing page can be added later if needed.

## Acceptance Criteria

- [x] Landing page renders at `/` (Lithuanian) and `/en` (English) with full content
- [x] Hero section has a clear CTA navigating to audience selector
- [x] Mode showcase shows audiences with working links
- [x] Page is fully responsive (mobile, tablet, desktop)
- [x] Open Graph tags generate proper social media previews
- [x] FAQ accordion is accessible (keyboard navigation, ARIA)
- [x] Sitemap and robots.txt are generated
- [x] JSON-LD structured data present
- [x] `npm run build` passes with zero errors
