# Bootstrap Habit Tracker ("lichen")

## Why

We have a feature spec (`habit-tracker-features.md`) and a high-fidelity React prototype (`Design/`) for a habit + mood tracking app. Neither is wired to a backend. This change ports the prototype into a real Next.js + SQLite application with authentication, persistent check-ins, and AI-powered coaching, while preserving the prototype's "lichen" visual identity.

## What

A single-repo Next.js 16 (App Router) application named **lichen**, with:

- **Auth** — Email + password via Auth.js v5, open signup, JWT sessions. No password reset in v1.
- **Persistence** — SQLite via `better-sqlite3`, file at `./data/lichen.db`, plain SQL migrations.
- **Multi-user** — Real `users` table; every domain row scoped by `user_id`. No team / shared concepts.
- **Onboarding** — 5-question profile flow (name asked at signup, remaining 4 post-signup).
- **Daily check-in** — Mood + up to 3 habit questions + reflection. Writes to `check_ins`, `habit_logs`, `mood_logs`.
- **Derived stats** — Streak, level, XP, longest streak computed from `check_ins` on read. No `user_stats` table.
- **AI coaching** — Anthropic API key in `.env`. Algorithmic grading 6/7 days; Claude analysis 1/7 + on level-up + after low-mood streaks. Chatbot view with last-7-days context. Falls back to algorithmic when key missing.
- **Gamification** — XP rules and 15 badges per spec.
- **Insights** — Habit completion rate, mood trends, mood/habit correlation.
- **Theming** — "lichen" identity preserved: terracotta default + ochre/sage/plum/ink, evening dark mode, OKLCH tokens. Tweaks panel kept as dev-only overlay (gated by `NODE_ENV !== 'production'`).

## Non-goals

- Password reset (documented gap, v2)
- OAuth / magic-link providers (additive later)
- Mobile native app (web only)
- Real-time multi-device sync (single SQLite file, single host)
- Sharing, social, or team features
- Email sending / notifications
- Internationalization

## Scope at a glance

```
┌──────────────────────────────────────────────────────────────────┐
│ Next.js 16 App Router (React 19)                                 │
│                                                                  │
│  app/                                                            │
│    (auth)/login, /signup            ← public                     │
│    (app)/dashboard, /checkin,       ← protected by middleware    │
│           /insights, /badges,                                    │
│           /chat, /mood, /settings,                               │
│           /onboarding                                            │
│    api/ai/{analyze,chat}/route.ts   ← server-only Claude calls   │
│                                                                  │
│  lib/                                                            │
│    db.ts          better-sqlite3 + migrations runner             │
│    auth.ts        Auth.js v5 config (Credentials + argon2)       │
│    stats.ts       derive streak/xp/level from check_ins          │
│    grading.ts     algorithmic check-in grader                    │
│    ai.ts          Anthropic client + prompt templates            │
│    badges.ts      badge evaluation                               │
│                                                                  │
│  data/lichen.db   ← gitignored                                   │
│  .env             ← ANTHROPIC_API_KEY, AUTH_SECRET               │
└──────────────────────────────────────────────────────────────────┘
```

## Affected capabilities (new)

- `auth` — signup, login, sessions, route protection
- `onboarding` — first-run profile questions
- `check-ins` — daily ritual write path
- `dashboard` — derived read aggregations
- `gamification` — XP, levels, badges
- `ai-coaching` — Claude analysis + chatbot + fallback
- `insights` — stats and correlations
- `theming` — lichen identity + dev tweaks panel
