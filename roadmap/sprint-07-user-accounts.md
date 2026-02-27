# Sprint 7: User Accounts

**Status:** Complete
**Depends on:** Sprint 1
**Blocks:** Sprint 8, Sprint 9

## Goal

Add user authentication so players can save progress, sync across devices, and unlock premium features. Separate Players collection from admin Users. Support Google OAuth and email/password registration.

## What Was Done

### Collections
- [x] **Players collection** (`collections/Players.ts`) — Payload auth-enabled collection with email/password, OAuth fields (provider, providerId), profile (name, avatar, locale, preferredAudience), preferences (activeCategories, spicySettings)
- [x] **PlayerProgress collection** (`collections/PlayerProgress.ts`) — Per-question progress tracking with player relationship, questionId, audience, status, viewedAt

### Authentication
- [x] **AuthContext** (`context/AuthContext.tsx`) — React context with player state, login/register/logout methods, Google OAuth redirect, session check on mount
- [x] **Google OAuth** — Full flow via custom API routes (`/api/auth/google`, `/api/auth/google/callback`). Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` env vars.
- [x] **AuthProvider** integrated into app layout wrapping QuestionProvider

### Progress Sync
- [x] **Progress API** (`app/api/progress/route.ts`) — GET (fetch progress), POST (batch upsert), DELETE (clear all for account deletion)
- [x] **QuestionContext integration** — Syncs localStorage to server on first login; syncs individual state changes in real-time when authenticated; falls back to localStorage for anonymous users

### UI Components
- [x] **LoginSheet** — Bottom sheet with Google sign-in + email/password form
- [x] **UserMenu** — Avatar dropdown with profile/logout links
- [x] **Sidebar auth section** — Shows player info when authenticated, login button when anonymous

### Profile & Account
- [x] **Profile page** (`app/[locale]/(app)/profile/page.tsx`) — Player info, stats (answered/superliked/total), logout, account deletion with email confirmation

### i18n
- [x] Auth + profile translations in both Lithuanian and English

## Environment Variables Required

```
GOOGLE_CLIENT_ID=        # Google Cloud Console OAuth client ID
GOOGLE_CLIENT_SECRET=    # Google Cloud Console OAuth client secret
```

## Deferred to Future Sprints
- Apple OAuth (requires Apple Developer account)
- ProtectedRoute component (needed when premium features exist)
- Player preferences sync across devices
- Toast notification on first progress sync

## Acceptance Criteria

- [x] Players collection registered with auth enabled
- [x] Email/password registration and login via Payload REST API
- [x] Google OAuth infrastructure ready (needs env vars)
- [x] Progress syncs to server for authenticated users
- [x] Anonymous users play without account (localStorage)
- [x] First login merges localStorage progress
- [x] Profile page with stats and account deletion
- [x] Auth state reactive (UI updates on login/logout)
- [x] `npm run build` passes with zero errors
