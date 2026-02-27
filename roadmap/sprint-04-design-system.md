# Sprint 4: Design System

**Status:** Complete
**Depends on:** Sprint 1
**Blocks:** Sprint 5, Sprint 9

## Goal

Extract a reusable component library and design token system from the existing UI. Every interactive element should come from the design system, ensuring visual consistency across all current and future pages. Animations should use shared presets via Framer Motion.

## Tasks

- [x] **[M]** Create design tokens file — `lib/design-tokens.ts` exporting colors, spacing, radii, shadows (with glow variants), and typography tokens. Updated `tailwind.config.ts` to import colors, borderRadius, and boxShadow from tokens.

- [x] **[M]** Create animation presets — `lib/animations.ts` exporting Framer Motion presets: `fadeIn`, `fadeInUp`, `fadeInDown`, `slideUp/Down/Left/Right`, `scaleIn`, `scaleOut`, `cardSwipe`, `spicyCardFlip`, `pageTransition`, `staggerContainer`, `staggerItem`, `pressAnimation`, `staggerDelay()`. Spring configs: `snappy`, `gentle`, `bouncy`.

- [x] **[M]** Create `Button` component — `components/ui/Button.tsx` with variants: primary, secondary, ghost, danger. Sizes: sm, md, lg. Props: loading (with spinner), disabled, icon, fullWidth. Uses `pressAnimation` from animations.

- [x] **[M]** Create `Card` component — `components/ui/Card.tsx` with variants: default, elevated, outlined. Padding: none, sm, md, lg. Extends `HTMLMotionProps<'div'>` for full Framer Motion support.

- [x] **[S]** Create `Toggle` component — `components/ui/Toggle.tsx` with `role="switch"` and `aria-checked`. Uses `springs.snappy` for knob animation. Supports label + description.

- [x] **[S]** Create `Checkbox` component — `components/ui/Checkbox.tsx` with `role="checkbox"` and `aria-checked`. Colors: primary, accent. Supports label + description.

- [x] **[M]** Create `Header` component — `components/ui/Header.tsx` with props: title, showBack, backHref, leftAction, rightAction. Replaces the repeated header pattern across all pages.

- [x] **[S]** Create `Badge` component — `components/ui/Badge.tsx` with variants: default, success, warning, info. Sizes: sm, md. Used in SpicyCardDisplay.

- [x] **[S]** Create `Sheet` component — `components/ui/Sheet.tsx` as a slide-in panel. Supports side: left (sidebar) or bottom (mobile sheet). Uses backdrop + `springs.snappy` animation. Used by Sidebar.

- [x] **[S]** Create `Select` component — `components/ui/Select.tsx` as a styled radio-style selector. Supports icon + label per option. Used in Settings for rarity selection.

- [x] **[S]** Create `Counter` component — `components/ui/Counter.tsx` with animated number transitions via AnimatePresence. Supports current/total mode and label. Used in Sidebar and Categories.

- [x] **[M]** Create `PageLayout` + `PageContent` — `components/ui/PageLayout.tsx` as the shared page wrapper (`min-h-screen flex flex-col bg-background`). `PageContent` adds max-width, padding, and optional centering.

- [x] **[S]** Create component index file — `components/ui/index.ts` barrel export for clean imports: `import { Button, Card, Header } from '@/components/ui'`.

- [x] **[L]** Refactor existing pages to use design system:
  - Game page → PageLayout, Header (with leftAction/rightAction)
  - Settings page → PageLayout, PageContent, Header, Toggle, Select, Card, Button
  - Categories page → PageLayout, PageContent, Header, Counter, Checkbox, Button, stagger animations
  - Awesome page → PageLayout, PageContent, Header, Card, Button
  - Sidebar → Sheet, Button, Counter
  - SwipeCard → cardSwipe animation preset
  - SpicyCardDisplay → spicyCardFlip preset, Badge, fadeInUp
  - AudienceSelector → PageLayout, fadeInUp, pressAnimation, staggerDelay

## Files Changed

| Action | File |
|--------|------|
| Create | `lib/design-tokens.ts` |
| Create | `lib/animations.ts` |
| Create | `components/ui/Button.tsx` |
| Create | `components/ui/Card.tsx` |
| Create | `components/ui/Toggle.tsx` |
| Create | `components/ui/Checkbox.tsx` |
| Create | `components/ui/Header.tsx` |
| Create | `components/ui/Badge.tsx` |
| Create | `components/ui/Sheet.tsx` |
| Create | `components/ui/Select.tsx` |
| Create | `components/ui/Counter.tsx` |
| Create | `components/ui/PageLayout.tsx` |
| Create | `components/ui/index.ts` |
| Modify | `tailwind.config.ts` |
| Modify | `app/(app)/game/page.tsx` |
| Modify | `app/(app)/settings/page.tsx` |
| Modify | `app/(app)/categories/page.tsx` |
| Modify | `app/(app)/awesome/page.tsx` |
| Modify | `components/Sidebar.tsx` |
| Modify | `components/SwipeCard.tsx` |
| Modify | `components/SpicyCardDisplay.tsx` |
| Modify | `components/AudienceSelector.tsx` |

## Acceptance Criteria

- [x] All UI components live in `components/ui/` with consistent API patterns
- [x] Design tokens are the single source of truth for colors, spacing, and typography
- [x] `tailwind.config.ts` extends from design tokens (no magic values in config)
- [x] Every existing page uses design system components
- [x] Animation presets are used consistently (cardSwipe, spicyCardFlip, fadeInUp, stagger, springs)
- [x] All components have proper TypeScript types and accept `className` for escape-hatch styling
- [x] Components are accessible: Toggle uses role="switch", Checkbox uses role="checkbox"
- [x] `npm run build` passes with zero errors
