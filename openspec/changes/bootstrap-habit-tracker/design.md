## Context

The repo currently contains:
- `habit-tracker-features.md` — feature spec describing screens, data model, gamification, AI behavior
- `Design/` — a working React prototype (UMD React + Babel-standalone, single HTML, no build) covering all 9 screens with sample profiles and a live tweaks panel

There is no application code, no database, and no auth. This design covers porting the prototype into a production Next.js 16 app while preserving the prototype's "lichen" visual identity (terracotta/sage/plum palettes, OKLCH tokens, evening dark mode, dev tweaks panel).

Stakeholders: single developer (russell). Local-first, single-host, single-SQLite-file deployment. No team or social features.

## Goals / Non-Goals

**Goals:**
- Production-shaped Next.js 16 App Router project with auth, persistence, and AI coaching
- One source of truth for all derived stats (streak, level, xp, longest streak) — computed from `check_ins`, never stored
- Deterministic, fast algorithmic grading on 6/7 days; Claude-powered analysis sparingly
- Graceful degradation when `ANTHROPIC_API_KEY` is missing — algorithmic path stays fully functional
- Preserve all visual decisions in `Design/styles.css` and the screen JSX as the design source of truth
- Keep the dev tweaks panel as an in-app overlay gated to non-production builds

**Non-Goals:**
- Password reset flow (documented v2 gap)
- Email sending of any kind
- OAuth / magic-link providers (additive later, not v1)
- Real-time sync / multi-device / offline-first
- Sharing, social, teams, or any multi-tenant concepts beyond per-user scoping
- Native mobile app
- i18n
- Background jobs / scheduled tasks (no daily cron, no streak-decay job — streaks are computed)

## Decisions

### D1. Next.js 16 App Router with Server Actions for all writes

**Choice:** Server Actions for every mutation (signup, onboarding submit, check-in submit, mood log, settings update). Route Handlers (`app/api/*/route.ts`) only for AI streaming endpoints (`/api/ai/chat`, `/api/ai/analyze`).

**Why:** Server Actions are the idiomatic Next.js 16 write path — type-safe, no manual fetch wiring, automatic revalidation. The only reason to drop to Route Handlers is when we need streaming responses, which is exactly what the chatbot needs.

**Alternatives considered:**
- All Route Handlers + client fetch — more boilerplate, no benefit
- tRPC — overkill for a single-app monolith with no external clients

### D2. SQLite via `better-sqlite3` (synchronous), file at `./data/lichen.db`

**Choice:** `better-sqlite3` with WAL mode, plain SQL migrations in `lib/db/migrations/*.sql` applied in numeric order at boot.

**Why:** Synchronous API is simpler in Server Actions; better-sqlite3 is the fastest Node SQLite driver and well-maintained. Plain SQL migrations beat an ORM for a schema this small and avoid lock-in.

**Alternatives considered:**
- Prisma — extra build step, generated client, heavier than needed
- Drizzle — lighter than Prisma but still adds a layer; we don't need cross-DB portability
- `node:sqlite` (Node 22+) — viable, but better-sqlite3 has more battle-testing and richer prepared-statement ergonomics

**Caveat:** better-sqlite3 is a native module; deploy target must allow native bindings. Local-only deploy makes this a non-issue.

### D3. Auth.js v5 with Credentials provider + JWT sessions + argon2id hashing

**Choice:**
- Auth.js v5 (`next-auth@5`) configured with one Credentials provider
- Passwords hashed with `argon2` (argon2id, default params)
- JWT session strategy (no session table)
- `middleware.ts` redirects unauthenticated requests on `/(app)/*` to `/login`
- `AUTH_SECRET` in `.env`

**Why:** Auth.js is the de-facto Next.js auth library; Credentials lets us run fully offline. JWT sessions keep the schema simple — no session/account tables needed for v1, and adding OAuth later is purely additive (Auth.js will create the tables when we add adapters).

**Alternatives considered:**
- Lucia — excellent but smaller ecosystem, more code we'd own
- Roll our own — security risk, not worth the savings
- Clerk / WorkOS — paid, requires internet, overkill

**Trade-off:** JWT sessions can't be revoked server-side without extra plumbing. Acceptable for v1; if needed later, add a `sessions` table and switch strategy.

### D4. Derived stats — single source of truth is `check_ins`

**Choice:** A `lib/stats.ts` module exposes:

```
getUserStats(userId) → {
  currentStreak, longestStreak, totalXp, level, xpInLevel, xpForNextLevel,
  daysActive, lastCheckInDate
}
```

All values computed by reading the user's `check_ins` rows ordered by `date DESC`. No `user_stats` table.

**Why:** The user explicitly chose derive over store. For a single user with at most ~365 check-ins per year, recomputing on every dashboard load is microsecond-cheap with a `(user_id, date)` index. Eliminates drift between "stored stats" and "actual history."

**Streak definition:** consecutive calendar days (in user's local TZ) ending at today or yesterday with a check-in row. A check-in counts toward streak if `mood IS NOT NULL` (i.e., user actually submitted, not a draft).

**Performance backstop:** if a user crosses ~10k check-ins (~27 years), revisit. Until then, no caching.

**Alternative considered:** stored stats updated in a transaction per check-in. Faster reads, but introduces drift risk and requires backfill on schema changes. Not worth it at this scale.

### D5. AI gating: algorithmic 6/7 days, Claude 1/7 + level-up + low-mood streak

**Choice:** A `selectGradingPath(userId, todayCheckIn)` function returns `'algorithmic' | 'ai'`. Returns `'ai'` if any of:

- It is the user's "AI day" of the week (rotating; pin to Sundays UTC for simplicity)
- This check-in causes a level-up (computed by comparing pre- and post-XP)
- The last 3 check-ins (including today) all have mood ≤ 2 — supportive AI message

Otherwise `'algorithmic'`. If `ANTHROPIC_API_KEY` is missing or the Claude call fails, fall back to `'algorithmic'` and surface a generic message.

**Why:** Matches the spec's "1x per week, on user level-up, or after a low-mood streak" rule with deterministic, testable logic. Cost-bounded (worst case ~5 AI calls/week/user). Fallback ensures the app stays usable without an API key.

**Model:** `claude-haiku-4-5-20251001` for both analysis and chatbot — fast, cheap, and the prompts are short enough that capability isn't the bottleneck. Upgrade to Sonnet 4.6 only if quality becomes an issue.

**Prompt caching:** chatbot system prompt + user profile block cached (5-min TTL) since the chatbot conversation is multi-turn within a session.

### D6. Theming preserved via CSS custom properties + tweaks panel

**Choice:** Port `Design/styles.css` verbatim into `app/globals.css`. The five accent presets (terracotta/ochre/sage/plum/ink) and two themes (warm/evening) become CSS custom properties set by `<html data-theme="…" data-accent="…">`. The tweaks panel from the prototype is preserved as a client component, mounted only when `process.env.NODE_ENV !== 'production'`. Persisted to `localStorage` per-user.

**Why:** The prototype's CSS is the design contract. Re-deriving it would risk drift. The tweaks panel is invaluable during development for live preview and is gated out of prod.

### D7. Sample/demo accounts seeded at first migration

**Choice:** First-run migration seeds three demo accounts:
- `demo-fresh@lichen.local` / `demo` — empty (Day 1)
- `demo-mid@lichen.local` / `demo` — 12 days of varied check-ins
- `demo-power@lichen.local` / `demo` — 60 days, higher level, several badges

Tweaks panel includes a "switch to demo user" action **only in dev** that signs out and re-signs in as the chosen demo. In prod the panel is absent and the demo accounts are still seeded but no impersonation UI exists.

**Why:** Maps the prototype's `fresh|mid|power` sample profiles into real users for development and demo purposes. Open signup means real users can co-exist with demos in the same DB without conflict.

### D8. Schema (SQLite)

```
users(
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  communication_pref TEXT NOT NULL DEFAULT 'encouraging',  -- encouraging|direct|playful
  goal TEXT,                  -- health|productivity|mental_wellness|learning|relationships
  active_time TEXT,           -- morning|afternoon|evening|night
  onboarding_completed INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
)

habits(
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'binary',  -- binary|duration|count
  archived INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
)
INDEX habits_user_idx ON habits(user_id, archived)

check_ins(
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,                   -- YYYY-MM-DD in user-local TZ at submit time
  mood INTEGER NOT NULL,                -- 1..5
  reflection TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  ai_path TEXT NOT NULL,                -- algorithmic|ai
  ai_message TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, date)
)
INDEX check_ins_user_date_idx ON check_ins(user_id, date DESC)

habit_logs(
  id INTEGER PRIMARY KEY,
  check_in_id INTEGER NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  status TEXT NOT NULL,                 -- yes|no|partial
  difficulty TEXT,                      -- easy|okay|hard
  minutes INTEGER,
  note TEXT
)

mood_logs(
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL,                -- 1..5
  tags TEXT,                            -- JSON array
  note TEXT,
  logged_at INTEGER NOT NULL
)
INDEX mood_logs_user_idx ON mood_logs(user_id, logged_at DESC)

chat_messages(
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,                   -- user|assistant
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
)
INDEX chat_messages_user_idx ON chat_messages(user_id, created_at)

badges(
  code TEXT PRIMARY KEY,                -- e.g. 'first_step'
  name TEXT NOT NULL,
  description TEXT NOT NULL
)

user_badges(
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL REFERENCES badges(code),
  earned_at INTEGER NOT NULL,
  PRIMARY KEY(user_id, badge_code)
)
```

Notes:
- `check_ins.date` is stored as `YYYY-MM-DD` (user-local) so streak math is plain string compare
- `UNIQUE(user_id, date)` prevents double check-in
- All FKs cascade so deleting a user wipes their data cleanly
- Badges seeded in migration; `user_badges` populated by `lib/badges.ts` after each check-in

### D9. Project layout

```
app/
  layout.tsx                root <html data-theme data-accent> + <Providers>
  globals.css               ported from Design/styles.css
  (auth)/
    login/page.tsx
    signup/page.tsx
  (app)/
    layout.tsx              sidebar + auth-required wrapper
    onboarding/page.tsx     gates: redirects to dashboard if completed
    dashboard/page.tsx      RSC, calls getUserStats + getDashboardData
    checkin/page.tsx        client component (multi-step form)
    mood/page.tsx
    insights/page.tsx
    badges/page.tsx
    chat/page.tsx
    settings/page.tsx
  api/
    ai/analyze/route.ts     POST { checkInId } → { message }
    ai/chat/route.ts        POST { messages } → streamed text
components/
  (ported from Design/components.jsx + screens-*.jsx, split per screen)
  TweaksPanel.tsx           dev-only mount
lib/
  db/
    index.ts                better-sqlite3 client + migrations runner
    migrations/
      001_init.sql
      002_seed_badges.sql
      003_seed_demo_users.sql
  auth.ts                   Auth.js v5 config
  actions/
    auth.ts                 signupAction, etc.
    onboarding.ts           submitOnboardingAction
    check-in.ts             submitCheckInAction
    mood.ts                 logMoodAction
  stats.ts                  derived stats
  grading.ts                algorithmic grader + path selector
  ai.ts                     Anthropic client + prompt builders
  badges.ts                 badge evaluation rules
  habits.ts                 default habit templates
middleware.ts               protects (app)/* routes
data/lichen.db              gitignored
.env.example                ANTHROPIC_API_KEY=, AUTH_SECRET=
```

## Risks / Trade-offs

- **No password reset** → users who forget their password are locked out. Mitigation: documented in README and login page; v2 adds reset via email provider.
- **JWT session can't be revoked** → if a token leaks, it's valid until expiry. Mitigation: short session TTL (7 days), regenerate `AUTH_SECRET` rotates everyone out.
- **Derived stats scan all check-ins** → at scale, dashboard reads slow down. Mitigation: indexed `(user_id, date DESC)` keeps it fast to ~10k rows; revisit beyond.
- **better-sqlite3 native module** → fails on platforms without build toolchain. Mitigation: documented prerequisite (Node 22 + build tools); local-only deploy makes this irrelevant.
- **Single SQLite file** → no horizontal scaling, no concurrent writers across hosts. Mitigation: explicit non-goal; if needed later, migrate to LiteFS or Postgres.
- **AI cost spikes if gating logic is buggy** → could trigger AI on every check-in. Mitigation: hard cap at the route handler — refuse if a user has triggered AI more than 10 times in the trailing 7 days, log and fall back.
- **Crisis keywords in chatbot** → user might surface self-harm content. Mitigation: server-side keyword scan on chat input; if matched, prepend a hotline banner to the response and skip Claude call (or route to a hard-coded supportive reply).
- **Demo accounts in production DB** → confusing if a real user signs up at `demo-*@lichen.local`. Mitigation: reserve the `@lichen.local` domain at signup (reject as taken).
- **Tweaks panel leakage** → if the gate is bypassed, prod users see internal controls. Mitigation: gate is `NODE_ENV` check at component level AND the component is dynamic-imported only in dev.

## Migration Plan

This is a greenfield bootstrap — no existing app to migrate from. Deployment:

1. `npm install` (installs better-sqlite3, builds native binding)
2. Copy `.env.example` → `.env`, fill `AUTH_SECRET` (generate via `openssl rand -base64 32`) and optionally `ANTHROPIC_API_KEY`
3. `npm run dev` — DB auto-creates at `./data/lichen.db`, migrations run on boot, badges + demo users seeded
4. Visit `/signup` to create a real account, or log into a demo account

Rollback: delete `./data/lichen.db` to reset all state.

## Open Questions

- **Timezone for `check_ins.date`** — currently writing user-local. If a user travels across TZs mid-day, can they double check-in? Acceptable edge case for v1, document.
- **What counts as a "level-up day" for AI selection** — fire AI when XP crosses a level boundary mid-check-in, or only the next day? Fire same-day so the AI message celebrates the level-up.
- **Chat history retention** — keep forever, or trim to last 100 messages per user? Keep forever in v1; revisit if DB grows.
