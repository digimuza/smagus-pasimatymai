# Engineering Workflow — smagus-pasimatymai

This document is the authoritative process reference for all engineering agents working on this codebase. It defines how code changes are created, reviewed, merged, and tracked.

## Ownership

**CTO (Alex)** owns this document. Questions about process go to Alex via Paperclip.

---

## Core Rule: Always Use Worktrees

**Every issue gets its own git worktree.** Never work directly on `main`. Never work on another agent's branch. Never stack uncommitted changes across issues.

### Why worktrees

Git worktrees give each issue an isolated working directory on disk while sharing the same `.git` object store. Multiple agents can work concurrently without interfering with each other's uncommitted state, dependencies, or `node_modules` symlinks.

### Creating a worktree

When you check out a Paperclip issue, the harness creates the worktree automatically via `EnterWorktree`. You work inside it and the harness tears it down on `ExitWorktree`.

If you are operating outside the harness (manual work, debugging), create one yourself:

```bash
# From the repo root
git fetch origin
git worktree add ../smagus-pasimatymai-{ISSUE_ID} -b {BRANCH_NAME} origin/main
cd ../smagus-pasimatymai-{ISSUE_ID}
pnpm install   # isolated node_modules
```

Clean up after merging:

```bash
git worktree remove ../smagus-pasimatymai-{ISSUE_ID}
git branch -d {BRANCH_NAME}
```

---

## Branch Naming

```
{type}/{ISSUE_ID}-{short-slug}
```

Examples:
- `feat/SAN-42-dark-mode-toggle`
- `fix/SAN-71-null-pointer-auth`
- `chore/SAN-55-bump-drizzle`

Types follow conventional commit prefixes: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`.

**Never push directly to `main`.** Always open a PR.

---

## Step-by-Step: Working a Paperclip Issue

1. **Wake up** — Paperclip triggers your heartbeat with `PAPERCLIP_TASK_ID`.
2. **Checkout** — `POST /api/issues/{issueId}/checkout`. Never skip this.
3. **Enter worktree** — Use the `EnterWorktree` skill or create manually (see above).
4. **Read the issue** — `GET /api/issues/{issueId}/heartbeat-context`. Understand the *why*.
5. **Read the relevant code** — Use `Read`, `Grep`, `Glob`. Understand the system before changing it.
6. **Make the change** — Small, focused, testable commits. See [Commit Standards](#commit-standards).
7. **Run quality gates** — All must pass before opening a PR (see [CI/CD Gates](#cicd-gates)).
8. **Open a PR** — `gh pr create` with title, body, and issue reference.
9. **Update Paperclip** — Move issue to `in_review`, post a comment with the PR link.
10. **Exit worktree** — Use `ExitWorktree` skill or `git worktree remove`.

If blocked at any step, update the issue to `blocked` with a clear blocker description before exiting.

---

## Commit Standards

Use conventional commits. Every commit must include the Paperclip co-author trailer.

```
feat(SAN-42): add dark mode toggle to settings page

Switches theme based on system preference; persists to localStorage.

Co-Authored-By: Paperclip <noreply@paperclip.ing>
```

Format rules:
- Subject line: `type(scope): imperative mood, ≤72 chars`
- Scope is the Paperclip issue ID when applicable
- Body is optional unless the *why* is non-obvious
- **Always** include `Co-Authored-By: Paperclip <noreply@paperclip.ing>` — no exceptions

---

## CI/CD Gates

All of the following must pass before requesting PR merge. Run them locally first:

```bash
pnpm lint:check      # Biome — zero errors required
pnpm typecheck       # TypeScript strict — zero errors required
pnpm build           # Production build must succeed
pnpm test:coverage   # Unit tests ≥ 60% line/function/branch/statement
pnpm test:e2e        # Playwright chromium suite must pass
```

If any gate fails, fix it before setting the Paperclip issue to `in_review`. Do not open a PR with known failures.

---

## Pull Request Standards

- **Title:** `feat(SAN-42): short description` — conventional commit format
- **Body:** include the Paperclip issue link, a summary of *why* the change exists, and a brief test plan
- **Scope:** one issue per PR — do not bundle unrelated changes
- **Merge strategy:** squash-merge preferred to keep `main` history clean
- **Self-review first:** read your own diff before setting to `in_review`

Minimum PR body template:

```markdown
Closes SAN-XX

## Why
[One sentence: what problem this solves or what feature this adds]

## What changed
- [Bullet 1]
- [Bullet 2]

## Test plan
- [ ] Happy path tested
- [ ] Edge cases covered
- [ ] E2E passes locally
```

---

## Testing Requirements

### Unit tests (Vitest)

- Location: `lib/__tests__/**/*.test.ts`
- Write a unit test for every new function in `lib/`
- Coverage thresholds enforced in CI: 60% lines/functions/branches/statements
- Use a real test DB for DB query logic — no mocks

### E2E tests (Playwright)

- Location: `e2e/**/*.spec.ts`
- Every new page route needs an E2E: render check + primary action + unauthenticated redirect
- Every new API route needs at minimum: unauthenticated 401, authenticated 200

---

## Code Quality Standards

These supplement `CLAUDE.md` (the authoritative style reference loaded by all Claude agents).

### Non-negotiable rules

- **No `any` in `app/`, `lib/`, `components/`** — use `unknown` + narrowing
- **No raw SQL strings** — always use Drizzle's parameterised query builder
- **No hardcoded UI strings** — always use `useTranslations()` / `getTranslations()`
- **No secrets in client components** — all DB calls and env secrets stay server-side
- **No `dangerouslySetInnerHTML`** without a security review comment
- **No `--no-verify` on commits** — fix the hook failure instead

### Performance rule

Cognitive complexity limit is 25 per function. If you hit it, split the function.

### i18n rule

Both `messages/en.json` and `messages/lt.json` must be updated in the same commit. Missing keys in one locale block CI.

---

## Agent Coordination

### One issue per worktree

Never work on two issues simultaneously in the same worktree. If you are mid-issue and get woken for a second issue, finish or explicitly pause the first one (leave it `in_progress` with a comment) before switching.

### Blocked issues

If you are blocked:
1. `PATCH /api/issues/{issueId}` with `status: "blocked"` and a specific blocker comment
2. Set `blockedByIssueIds` if another issue is the root cause
3. Do not post the same blocked comment twice — Paperclip will wake you when the blocker resolves

### Escalation path

- Technical design questions → comment on the issue, @-mention Alex (CTO)
- Product/scope questions → comment on the issue, @-mention Riley (PM)
- Cross-team or budget questions → escalate to Dona (CEO)

---

## File Structure Reference

```
app/[locale]/          # Next.js App Router pages (i18n via next-intl)
app/api/               # API route handlers
components/            # Shared React components
lib/                   # Pure business logic, utilities, DB queries
  __tests__/           # Unit tests — mirror lib/ structure
messages/              # i18n translation files (en.json, lt.json)
scripts/               # One-off CLI scripts (db seed, etc.)
e2e/                   # Playwright E2E tests
public/                # Static assets
docs/                  # Process and design documentation
```

---

## Quick Reference Card

| Task | Command |
|---|---|
| Start dev server | `pnpm dev` (port 7743) |
| Run linter | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Run unit tests | `pnpm test` |
| Run unit tests + coverage | `pnpm test:coverage` |
| Run E2E tests | `pnpm test:e2e` |
| Run DB migrations | `pnpm db:migrate` |
| Open DB studio | `pnpm db:studio` |
| Build for prod | `pnpm build` |
