# Redesign — Finesse documentation aesthetic

## Why

The current "lichen v1" aesthetic (cream/paper canvas, terracotta palette, Fraunces italic, hand-drawn ink underlines, OKLCH-tinted accents) shipped as a faithful port of the original prototype. It has real character but doesn't match where the product is going. A second prototype has been delivered — `docs/design-prototype/` (now `New Design/`) v3 — that commits to a sharper, documentation-system aesthetic ("Finesse"): white canvas, **black** as the hero ink color, violet + finesse-yellow accents, Inter / Public Sans / Space Mono, sharp 6px corners, gradient washes at the top of pages, "notation tag" pill eyebrows, and a circle-arrow CTA pattern.

The two aesthetics make opposing claims about what the product is — warm/handmade journal vs. precise/data-driven companion. The pivot is intentional. This change replaces the v1 aesthetic wholesale.

## What

A full design-system replacement applied to the existing implementation. Functionality is unchanged; **only presentation changes**.

- **Tokens** — `app/globals.css` rewritten from scratch using the v3 tokens: white parchment canvas, black ink hero, violet (`rgb(123,97,255)`) + finesse-yellow (`rgb(255,237,107)`) accents, sharp 6px radius, Inter + Public Sans + Space Mono.
- **Layout primitives** — `.page-wash` (radial yellow + violet gradient at top of each page), `.page-pad` / `.page-body` wrappers, `.notation-tag` pill eyebrow, `.btn-cta` circle-arrow primary, `.card-ink` for the AI suggestion (black card with finesse-yellow circle decoration).
- **Sidebar** — outlined-rectangle nav items (always visible borders, not hover-only), profile card stays at bottom but uses a violet avatar circle + flame emoji.
- **Dashboard** — reverts to v2's 4-stat grid (streak / level / mood-today / mood-7d) followed by the asymmetric ink AI card + habits-with-checkboxes row, then the calendar. The post-critique day-1 collapsed invitation card is removed; v2 always shows the full grid (cards self-zero on day 1 cleanly because the visual language is data-table, not journal).
- **Insights** — reverts to a 4-stat row at top + completion bars + correlation card + sparkline. The Fraunces-italic editorial paragraph approach is dropped.
- **Components** — Sidebar, OnboardingFlow, CheckInForm, MoodLogForm, ChatInterface, ResetDataButton, SettingsProfileForm, SettingsThemePicker, all card chrome — all updated to v2 patterns.
- **Tweaks panel** — replaced. The v1 panel's 5-accent + 2-theme picker no longer applies (Finesse has one accent system). Replaced by a leaner dev panel that exposes only what's still configurable: theme (warm/evening), demo-user impersonation, and jump-to-flow shortcuts.
- **Fonts** — Inter + Public Sans + Space Mono replace Inter Tight + Fraunces + JetBrains Mono. **Fraunces italic is dropped entirely.** The italic-emphasis-on-key-words pattern (`<span class="ink-underline">really</span>`) is replaced by a sans-serif emphasis (bold, color-shift, or notation-tag).

## Non-goals

- No functional changes — every server action, DB query, and API route stays as-is.
- No new features — this is presentation only.
- No incremental rollout — there's no "beta" toggle. The new design is the new design.
- No support for accent picking. Violet is the only accent.
- No re-running the OKLCH terracotta/sage/plum/ochre palette as a "theme" option. It's gone.
- No recreation of the hand-drawn ink-underline SVG squiggle. Finesse uses solid lines and pill borders for emphasis.

## Scope at a glance

```
┌─────────────────────────────────────────────────────────────────┐
│ FILES TOUCHED                                                   │
│                                                                 │
│   app/globals.css                  rewrite (~531 → ~670 lines)  │
│   app/layout.tsx                   font hrefs swap              │
│   app/(app)/layout.tsx             sidebar profile + tweaks     │
│   app/(app)/dashboard/page.tsx     full v2 dashboard (4-stat +  │
│                                    ink AI card + checkbox       │
│                                    habits + calendar)           │
│   app/(app)/checkin/page.tsx       v2 check-in (notation-tag    │
│                                    eyebrows, sharp option       │
│                                    buttons, mono progress)      │
│   app/(app)/checkin/done/page.tsx  page-wash + ink-card layout  │
│   app/(app)/insights/page.tsx      4-stat + bars + correlation  │
│   app/(app)/mood/page.tsx          v2 mood log + heatmap        │
│   app/(app)/badges/page.tsx        v2 tile grid                 │
│   app/(app)/chat/page.tsx          page-wash + companion ink    │
│                                    bubbles                      │
│   app/(app)/settings/page.tsx      v2 settings sections         │
│   app/(app)/onboarding/page.tsx    v2 onboarding wash + dot row │
│   app/(app)/loading.tsx            v2 skeleton (sharp + mono)   │
│   app/(auth)/{login,signup}        v2 onboard-stage layout      │
│                                                                 │
│   components/Sidebar.tsx           outline-rect nav + violet    │
│                                    avatar profile card          │
│   components/Icon.tsx              add: chevron-right, envelope,│
│                                    bolt; rest unchanged         │
│   components/visual.tsx            Sparkline color → violet;    │
│                                    FlameStamp geometric (yellow │
│                                    + ink stroke + red core)     │
│   components/OnboardingFlow.tsx    notation-tag eyebrows        │
│   components/CheckInForm.tsx       sharp option buttons         │
│   components/MoodLogForm.tsx       Finesse mood-face style      │
│   components/ChatInterface.tsx     ink user bubbles, paper-warm │
│                                    AI bubbles                   │
│   components/SettingsProfileForm   sharper inputs               │
│   components/SettingsThemePicker   warm/evening only (no accent)│
│   components/ResetDataButton       sharp                        │
│   components/XpAnimation           pill chip → notation-tag-look│
│   components/TweaksPanel           v2 panel content             │
│   components/ThemeApplier          drop accent presets          │
│   components/DevTweaksMount        unchanged                    │
│                                                                 │
│   lib/constants.ts                 unchanged (CRISIS_BANNER)    │
│                                                                 │
│ NOT TOUCHED                                                     │
│                                                                 │
│   lib/db/, lib/auth.ts, lib/stats.ts, lib/grading.ts,           │
│   lib/badges.ts, lib/insights.ts, lib/ai.ts, lib/actions/*,     │
│   scripts/, data/, migrations/, proxy.ts, next.config.js,       │
│   tsconfig.json, package.json (no new deps).                    │
└─────────────────────────────────────────────────────────────────┘
```

## Affected capabilities

- `theming` — **MODIFIED**. The lichen-identity requirement (terracotta default, 5 accents, OKLCH) is replaced with the Finesse-identity requirement (white canvas, black ink hero, violet + finesse-yellow accents, no accent picker). User-selectable theme (warm/evening) remains. Tweaks panel scope shrinks accordingly.

No other capability specs change — onboarding, check-ins, dashboard, gamification, ai-coaching, insights, auth all describe behavior, not visual treatment.

## Risks

| Risk | Mitigation |
|---|---|
| Loss of the prototype's voice work (Fraunces italic on "really", "now", "data") | Replace italic emphasis with notation-tag pills above headers, or with bolder weight in Inter 700 — the v2 prototype already shows this works |
| Reverts the critique-pass change that killed the 4-stat row on `/insights` | Documented intentional reversal — sharp data-table cards are *correct* in a Finesse-doc context, only become slop in a soft journal-app context |
| Day-1 dashboard goes from focused single-card invitation back to full 4-stat-zeros grid | Acceptable — the v2 visual language treats zeros as plain data, not failure-to-fill-cards. The CTA is large and clear |
| Production rebuild needed; existing Turbopack cache pollution | `rm -rf .next` once after shipping |
| Users with existing `lichen.theme` and `lichen.accent` localStorage values | Accent value is ignored (only one accent now). Theme value is still respected. No migration needed |

## Output

When this change ships:

- The cream/terracotta lichen v1 visual identity is gone. The product reads as a sharp, modern, documentation-system app with black + violet + yellow as the brand colors.
- All current functionality continues to work, identical server-side behavior.
- The next time someone opens `/dashboard`, they see a wash gradient at the top, a notation pill date, a black "Begin check-in" button, four sharp metric cards in a row, an ink-black AI companion card with a yellow accent decoration, a habits-with-checkboxes row, and a sharp month calendar.
