# Sprint 7: User Accounts

**Status:** Not Started
**Depends on:** Sprint 1
**Blocks:** Sprint 8, Sprint 9

## Goal

Add user authentication so players can save progress, sync across devices, and unlock premium features. Use a separate `Players` collection (distinct from admin `Users`). Support Google and Apple OAuth for frictionless signup. Merge existing localStorage progress on first login.

## Tasks

- [ ] **[M]** Create `Players` collection — New collection in `collections/Players.ts` with fields:
  - `email` (email, unique)
  - `name` (text)
  - `avatar` (text, URL from OAuth provider)
  - `provider` (select: `google`, `apple`, `email`)
  - `providerId` (text, OAuth subject ID)
  - `locale` (select: `lt`, `en`)
  - `preferredAudience` (relationship to Audiences)
  - `subscription` (relationship to Subscriptions, Sprint 8)
  - `createdAt`, `updatedAt` (auto)

- [ ] **[M]** Create `PlayerProgress` collection — New collection in `collections/PlayerProgress.ts` with fields:
  - `player` (relationship to Players)
  - `questionId` (relationship to Questions)
  - `status` (select: `viewed`, `skipped`, `favorited`)
  - `viewedAt` (date)
  - Compound unique index on `player` + `questionId`.

- [ ] **[L]** Set up Google OAuth — Configure Google OAuth using NextAuth.js or Payload's built-in auth:
  - Create Google Cloud OAuth credentials
  - Implement `app/(app)/api/auth/google/route.ts` for OAuth flow
  - Create or find Player on callback, issue session token
  - Store refresh token securely

- [ ] **[L]** Set up Apple OAuth — Configure Sign in with Apple:
  - Create Apple Developer Service ID
  - Implement `app/(app)/api/auth/apple/route.ts`
  - Handle Apple's unique JWT-based identity token
  - Create or find Player on callback

- [ ] **[M]** Build auth UI components — Create:
  - `components/auth/LoginSheet.tsx` — bottom sheet with Google/Apple sign-in buttons
  - `components/auth/UserMenu.tsx` — avatar + dropdown with profile, settings, logout
  - `components/auth/ProtectedRoute.tsx` — wrapper that redirects to login if unauthenticated (for premium features)

- [ ] **[M]** Create `AuthContext` — Create `context/AuthContext.tsx` providing:
  - `player` (current player object or null)
  - `isAuthenticated` (boolean)
  - `isLoading` (boolean)
  - `login(provider)`, `logout()` methods
  - Session token management (httpOnly cookie)

- [ ] **[M]** Build progress sync API — Create `app/(app)/api/progress/route.ts`:
  - `GET /api/progress` — return all PlayerProgress for authenticated player
  - `POST /api/progress` — batch upsert progress records
  - `PATCH /api/progress/:questionId` — update single record

- [ ] **[M]** Merge localStorage progress on first login — On first authentication:
  1. Read existing progress from localStorage (viewed questions, favorites)
  2. POST to progress sync API to create PlayerProgress records
  3. Clear localStorage progress data
  4. Show a toast: "Progress synced! Your history is now saved to your account."

- [ ] **[S]** Update QuestionContext for authenticated users — Modify `context/QuestionContext.tsx`:
  - If authenticated: fetch progress from API, save progress to API
  - If anonymous: continue using localStorage (current behavior)
  - Shared interface so game logic doesn't care about storage backend

- [ ] **[S]** Add player preferences sync — Sync locale, preferred audience, and category selections to the Player record. On login from a new device, apply these preferences automatically.

- [ ] **[S]** Build profile page — Create `app/(app)/[locale]/profile/page.tsx` showing:
  - Player name, email, avatar
  - Stats: total questions viewed, favorites count, sessions played
  - Account actions: change name, delete account
  - Subscription status (placeholder for Sprint 8)

- [ ] **[S]** Implement account deletion — Add a "Delete Account" flow that:
  - Confirms with the user (type email to confirm)
  - Deletes all PlayerProgress records
  - Deletes the Player record
  - Clears session and redirects to home

## Acceptance Criteria

- Users can sign in with Google and Apple OAuth in under 3 taps
- New players are created in the Players collection (not the admin Users collection)
- Progress (viewed, skipped, favorited) syncs to the server for authenticated users
- Anonymous users can still play without an account (localStorage fallback)
- First login merges existing localStorage progress without data loss
- Session persists across page reloads (httpOnly cookie)
- Profile page shows accurate statistics
- Account deletion permanently removes all player data
- Auth state is reactive — UI updates immediately on login/logout
