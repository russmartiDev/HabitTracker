# lichen

A warm, human habit tracker. Mood + habits + AI companion, built on Next.js 16 + SQLite.

This is the implementation of `bootstrap-habit-tracker` (see `../openspec/changes/bootstrap-habit-tracker/` for proposal, design, specs).

## Stack

- **Next.js 16** (App Router, Turbopack, Server Actions)
- **React 19**
- **SQLite** via `better-sqlite3`, file at `./data/lichen.db`
- **Auth.js v5** (Credentials + JWT, argon2id password hashing)
- **Anthropic Claude Haiku 4.5** for check-in analysis + chatbot (optional — falls back to algorithmic when no API key)
- All state derived from `check_ins` (no `user_stats` table)
- **Visual identity: Finesse** — white parchment canvas, black ink hero, violet + finesse-yellow accents, Inter / Public Sans / Space Mono, sharp 6px corners, gradient page washes. See `openspec/changes/redesign-finesse-aesthetic/` for the design rationale.

## Quick start

```bash
# Prereqs: Node 22+ and a working C/C++ toolchain (for better-sqlite3 + argon2 native modules).

cd lichen
npm install                                    # ~3–5 min on WSL/mnt; native module compile

cp .env.example .env
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env
# Optional: ANTHROPIC_API_KEY=sk-ant-...

npm run seed:demo    # creates 3 demo users + sample data
npm run dev          # http://localhost:3000
```

## Demo accounts

All passwords are `demo`.

| Email | State |
|---|---|
| `demo-fresh@lichen.local` | Day 1 — no check-ins, ready to onboard |
| `demo-mid@lichen.local` | 12 days of check-ins, 3 habits, mid streak |
| `demo-power@lichen.local` | 60 days, multiple badges, higher level |

These accounts seed `@lichen.local` emails which are reserved (real signups can't use the domain).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Next lint |
| `npm run migrate` | Apply pending SQL migrations only (no seed) |
| `npm run seed:demo` | Wipe + reseed the 3 demo users |

## Repo layout

```
lichen/
├── app/                      Next.js App Router
│   ├── (auth)/               public — /login, /signup
│   ├── (app)/                authed — dashboard, check-in, mood, insights, badges, chat, settings, onboarding
│   ├── api/auth/             Auth.js handler
│   ├── api/ai/chat/          POST → streamed Claude responses
│   ├── globals.css           ported from Design/styles.css verbatim
│   └── layout.tsx, page.tsx
├── components/               TypeScript ports of Design/*.jsx + new client components
├── lib/
│   ├── db/                   better-sqlite3 + plain SQL migrations
│   ├── actions/              Server actions (auth, login, onboarding, check-in, mood, settings)
│   ├── auth.ts               Auth.js v5 config
│   ├── stats.ts              derived stats (streak, level, XP, calendar)
│   ├── grading.ts            algorithmic message templates + path selector + crisis scanner
│   ├── badges.ts             15 badge evaluators + gallery query
│   ├── insights.ts           aggregations for /insights
│   ├── ai.ts                 Anthropic client (server-only)
│   └── constants.ts          client-safe constants (no DB import)
├── scripts/migrate.ts, seed-demo.ts
├── proxy.ts                  pass-through middleware (sets x-pathname)
├── data/                     SQLite file lives here, gitignored
└── README.md
```

## Notable design decisions

See `../openspec/changes/bootstrap-habit-tracker/design.md` for full rationale. Highlights:

- **Derived stats** — streak, level, XP all computed from `check_ins` on every read. No drift, no backfill.
- **AI gating** — algorithmic 6/7 days, Claude on the user's "AI day of week" + on level-up + after a 3-day low-mood streak. Hard cap at 10 AI calls per trailing 7 days. Missing API key → falls back transparently.
- **Auth in layouts, not middleware** — `proxy.ts` only sets headers (Edge runtime can't load `better-sqlite3`/`argon2`). The `(auth)` and `(app)` layouts enforce session.
- **Demo accounts at `@lichen.local`** — domain reserved at signup so real users can co-exist.
- **Tweaks panel is dev-only** — gated by `NODE_ENV`, mounted only when not production. Lets you flip accent/theme live.

## Known v1 limitations

- **No password reset.** Documented on the login page.
- **No OAuth / magic-link.** Email + password only. Auth.js makes adding providers additive later.
- **Theme/accent stored in localStorage** (per-browser). Real persistence to `users` table is a v2 follow-on.
- **Habit editing UI** isn't in settings yet — habits are fixed at onboarding for v1.
- **No `/api/ai/analyze` HTTP endpoint** — `submitCheckInAction` calls `lib/ai.ts` directly server-side. An HTTP wrapper was deferred as it would only add latency for same-process invocation.
- **Unit tests deferred.** The check-in / streak / level-curve logic is exercised through smoke tests but doesn't yet have a vitest harness.

## Resetting

```bash
# Nuke local DB and reseed
rm -f data/lichen.db data/lichen.db-shm data/lichen.db-wal
npm run seed:demo
```

## Troubleshooting

- **better-sqlite3 build fails on `npm install`** — install the platform's C++ build tools (`apt install build-essential` on Ubuntu/WSL, Xcode CLT on macOS).
- **"Couldn't find a `.env` file"** — copy `.env.example` to `.env` and set `AUTH_SECRET`. App boots without `ANTHROPIC_API_KEY`.
- **Turbopack cache feels stale after refactor** — `rm -rf .next` and restart `npm run dev`.
