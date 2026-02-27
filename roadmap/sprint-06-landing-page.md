# Sprint 6: Landing Page Rebuild

**Status:** Not Started
**Depends on:** Sprint 5
**Blocks:** Sprint 9

## Goal

Build a marketing landing page that converts visitors into users. The landing page content should be editable via PayloadCMS (as a Global), support both Lithuanian and English, and be optimized for SEO and Core Web Vitals.

## Tasks

- [ ] **[M]** Create `LandingPage` Payload Global — Create `collections/globals/LandingPage.ts` as a Payload Global (not a collection) with localized fields:
  - `hero`: title, subtitle, ctaText, ctaLink, backgroundImage
  - `howItWorks`: array of steps (icon, title, description)
  - `audiences`: array of audience showcases (title, description, image, link)
  - `socialProof`: array of testimonials (quote, author, rating)
  - `faq`: array of Q&A pairs (question, answer)
  - `footer`: copyright, social links, legal links

- [ ] **[S]** Seed landing page content — Add Lithuanian landing page content to the seed script. Include real copy for hero, 3 how-it-works steps, 4 audience showcases, 3 testimonials, 5 FAQ items.

- [ ] **[M]** Build Hero section — `components/landing/Hero.tsx` with:
  - Large heading + subtitle from CMS
  - CTA button using design system `Button`
  - App screenshot or animated card preview
  - Background gradient consistent with app theme
  - Framer Motion entrance animations

- [ ] **[M]** Build "How It Works" section — `components/landing/HowItWorks.tsx` with 3 numbered steps, icons, and descriptions. Staggered scroll-triggered animations.

- [ ] **[M]** Build Audience Showcase section — `components/landing/AudienceShowcase.tsx` displaying all available audiences (romantic, family, kids, friends) as interactive cards. Each links to the game with that audience pre-selected.

- [ ] **[S]** Build Social Proof section — `components/landing/SocialProof.tsx` with testimonial cards in a horizontal scroll or carousel. Star ratings, quote text, author name.

- [ ] **[S]** Build FAQ section — `components/landing/FAQ.tsx` as an accordion using Framer Motion for expand/collapse. Content from CMS.

- [ ] **[S]** Build landing page footer — `components/landing/Footer.tsx` with copyright, links to privacy policy, terms of service, social media icons.

- [ ] **[M]** Assemble landing page route — Create `app/(app)/[locale]/page.tsx` (or root page) that fetches the LandingPage global from Payload, passes sections to components. Server-rendered for SEO.

- [ ] **[M]** SEO optimization — Add comprehensive metadata:
  - `generateMetadata()` with localized title, description, Open Graph tags
  - JSON-LD structured data (SoftwareApplication)
  - Sitemap generation (`app/sitemap.ts`)
  - `robots.txt` configuration
  - Canonical URLs per locale

- [ ] **[S]** Core Web Vitals optimization — Ensure landing page scores 90+ on Lighthouse:
  - Optimize images (use `next/image` with proper sizing)
  - Minimize CLS (reserve space for dynamic content)
  - Preload critical fonts
  - Lazy-load below-fold sections

## Acceptance Criteria

- Landing page renders at `/` (Lithuanian) and `/en` (English) with full content
- All text content is editable from Payload admin panel under Globals → Landing Page
- Hero section has a clear CTA that navigates to the game
- Audience showcase shows all active audiences with working links
- Page is fully responsive (mobile, tablet, desktop)
- Lighthouse performance score ≥ 90
- Open Graph tags generate proper social media previews
- FAQ accordion is accessible (keyboard navigation, ARIA)
- Page loads in < 2 seconds on 3G connection (server-rendered, minimal JS)
