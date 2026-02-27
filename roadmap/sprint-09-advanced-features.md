# Sprint 9: Advanced Features

**Status:** Done (partial — core features)
**Depends on:** Sprint 2, Sprint 3, Sprint 4, Sprint 7, Sprint 8
**Blocks:** Sprint 10

## Goal

Add engagement and social features that increase retention and virality. These are differentiators that make the app more than a simple card deck — daily questions, streaks, sharing, achievements, and user-submitted content.

## Tasks

- [x] **[M]** Daily question feature — Create `collections/DailyQuestions.ts` with fields: `date` (date, unique), `question` (relationship to Questions), `audience` (relationship to Audiences). Build a cron-like mechanism (Payload hook on admin action or external trigger) that selects a random unseen question each day. Create `components/DailyQuestion.tsx` showing the daily question with a special card design and share button. Display on the home screen.

- [ ] **[L]** Question packs — Create `collections/QuestionPacks.ts` with fields: `name`, `description`, `icon`, `questions` (relationship to Questions, hasMany), `audience`, `isPremium` (checkbox), `sortOrder`. Build `components/QuestionPacks.tsx` as a browsable grid of themed packs (e.g., "Deep Conversations", "Spicy Night", "Road Trip", "First Date"). Packs provide curated, shorter game sessions.

- [x] **[M]** Social sharing with OG images — Create `app/(app)/api/og/route.tsx` using `@vercel/og` to generate dynamic Open Graph images:
  - Question card image: shows the question text on a branded card background
  - Stats image: "We've answered 200 questions together!"
  - Build share buttons (native Web Share API with fallback) on question cards and results screens.

- [x] **[M]** Streak tracking — Add `currentStreak` (number) and `longestStreak` (number) and `lastPlayedDate` (date) fields to Players collection. Create `lib/streaks.ts` that calculates streak on each session:
  - If `lastPlayedDate` is yesterday: increment `currentStreak`
  - If `lastPlayedDate` is today: no change
  - Otherwise: reset `currentStreak` to 1
  - Update `longestStreak` if exceeded.
  - Show streak fire icon in the header with animated counter.

- [x] **[M]** Custom question submissions — Create `collections/QuestionSubmissions.ts` with fields: `text` (textarea), `category` (relationship), `audience` (relationship), `submittedBy` (relationship to Players), `status` (select: `pending`, `approved`, `rejected`), `moderatorNote` (textarea). Build `components/SubmitQuestion.tsx` form. Admin reviews submissions in Payload and can approve (which creates a real Question) or reject.

- [x] **[S]** Favorites management page (enhanced awesome page) — Create `app/(app)/[locale]/favorites/page.tsx` showing all favorited questions in a searchable, filterable list. Allow unfavoriting, sharing individual questions, and starting a game session with only favorites.

- [ ] **[L]** Achievement system — Create `collections/Achievements.ts` with fields: `slug`, `name`, `description`, `icon`, `condition` (JSON describing trigger), `points` (number). Create `collections/PlayerAchievements.ts` linking players to earned achievements with `earnedAt` date. Define 15+ achievements:
  - "First Question" — view your first question
  - "Night Owl" — play after midnight
  - "Streak Master" — 7-day streak
  - "Explorer" — try all 4 audiences
  - "Collector" — favorite 50 questions
  - etc.
  - Build `components/Achievements.tsx` with a trophy case grid and unlock animations.

- [ ] **[M]** Multiplayer prototype — Design and build a basic "same room" multiplayer mode:
  - One device acts as the "host" and shows questions
  - Players take turns answering (honor system, no networking)
  - Track which player answered each question
  - Simple scoreboard at the end of a session
  - This is a local-only prototype; real-time multiplayer is out of scope.

- [ ] **[S]** Re-engagement notifications concept — Document a push notification strategy using web push or email:
  - Daily question reminder (morning)
  - Streak at risk (evening if not played today)
  - New content pack available
  - Implement the notification permission request UI only; actual sending is Sprint 10.

## Acceptance Criteria

- Daily question updates each day and displays prominently on the home screen
- Question packs appear as browsable, themed collections with clear premium/free labels
- Sharing a question generates a branded OG image visible on social media previews
- Streak counter updates correctly: +1 for consecutive days, resets on gap
- Users can submit custom questions that appear in the admin moderation queue
- Favorites page shows all favorited questions with search and filter
- Achievement unlocks show a celebratory animation and appear in the trophy case
- Multiplayer mode works on a single device with turn-based question flow
- All features respect the free/premium tier boundaries
