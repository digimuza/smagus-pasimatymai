# Sprint 4: Design System

**Status:** Not Started
**Depends on:** Sprint 1
**Blocks:** Sprint 5, Sprint 9

## Goal

Extract a reusable component library and design token system from the existing UI. Every interactive element should come from the design system, ensuring visual consistency across all current and future pages. Animations should use shared presets via Framer Motion.

## Tasks

- [ ] **[M]** Create design tokens file — Create `lib/design-tokens.ts` exporting:
  - `colors`: primary, secondary, accent, background, surface, text (with light/dark variants)
  - `spacing`: scale from 0 to 20 (mapped to Tailwind spacing)
  - `radii`: sm, md, lg, xl, full
  - `shadows`: sm, md, lg
  - `typography`: heading, subheading, body, caption (with font sizes and weights)
  - Update `tailwind.config.ts` to reference these tokens via `theme.extend`.

- [ ] **[M]** Create `Button` component — `components/ui/Button.tsx` with variants: `primary`, `secondary`, `ghost`, `danger`. Sizes: `sm`, `md`, `lg`. Props: `loading`, `disabled`, `icon`, `fullWidth`. Use Framer Motion for press animation.

- [ ] **[M]** Create `Card` component — `components/ui/Card.tsx` as the base for question cards, spicy cards, audience cards. Variants: `default`, `elevated`, `outlined`. Props: `padding`, `onClick`, `animate`. Support swipe gesture integration.

- [ ] **[S]** Create `Toggle` component — `components/ui/Toggle.tsx` for boolean settings (sound on/off, dark mode). Accessible with proper ARIA attributes.

- [ ] **[S]** Create `Checkbox` component — `components/ui/Checkbox.tsx` for multi-select scenarios (category selection). Support `indeterminate` state.

- [ ] **[M]** Create `Header` component — `components/ui/Header.tsx` as the shared app header. Props: `title`, `leftAction`, `rightAction`, `showBack`. Renders audience badge, settings gear, back arrow as needed.

- [ ] **[S]** Create `Badge` component — `components/ui/Badge.tsx` for audience indicators, category tags, "NEW" labels. Variants: `default`, `success`, `warning`, `info`. Sizes: `sm`, `md`.

- [ ] **[S]** Create `Sheet` component — `components/ui/Sheet.tsx` as a bottom sheet / drawer for mobile. Used for settings, audience selector, filters. Uses Framer Motion for slide-up animation.

- [ ] **[S]** Create `Select` component — `components/ui/Select.tsx` styled dropdown for locale picker, audience picker in settings. Support option groups and icons.

- [ ] **[S]** Create `Counter` component — `components/ui/Counter.tsx` showing "Question 12 of 576" with animated number transitions.

- [ ] **[M]** Create `PageLayout` component — `components/ui/PageLayout.tsx` as the shared page wrapper. Handles max-width, padding, safe areas, and the consistent background gradient.

- [ ] **[M]** Create animation presets — `lib/animations.ts` exporting Framer Motion variants:
  - `fadeIn`, `fadeOut`
  - `slideUp`, `slideDown`, `slideLeft`, `slideRight`
  - `scaleIn`, `scaleOut`
  - `cardSwipe` (for question card swiping)
  - `staggerChildren` (for list animations)
  - Spring configs: `snappy`, `gentle`, `bouncy`

- [ ] **[L]** Refactor existing pages to use design system — Go through all pages in `app/(app)/` and replace inline styles, ad-hoc components, and raw HTML elements with design system components. Specifically:
  - Game page: use Card, Header, Counter, Button
  - Settings page: use PageLayout, Header, Toggle, Select
  - Categories page: use PageLayout, Header, Badge, Checkbox

- [ ] **[S]** Create component index file — `components/ui/index.ts` that re-exports all components for clean imports: `import { Button, Card, Header } from '@/components/ui'`.

## Acceptance Criteria

- All UI components live in `components/ui/` with consistent API patterns
- Design tokens are the single source of truth for colors, spacing, and typography
- `tailwind.config.ts` extends from design tokens (no magic values in component files)
- Every existing page uses design system components (no raw `<button>`, `<div className="card">`, etc.)
- Animation presets are used consistently — no inline Framer Motion configs scattered across components
- All components have proper TypeScript types and accept `className` for escape-hatch styling
- Components are accessible: proper ARIA roles, keyboard navigation, focus indicators
