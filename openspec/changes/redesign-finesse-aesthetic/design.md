## Context

`bootstrap-habit-tracker` shipped the lichen v1 aesthetic — a faithful port of `docs/design-prototype/`'s warm, paper-toned, terracotta-accented visual identity. That aesthetic is being replaced wholesale by `New Design/styles-v3.css` ("Finesse"), which the user has now built and chosen. The new aesthetic is a documentation-system look: white canvas, black hero ink, violet + finesse-yellow accents, sharp 6px corners, gradient washes at page tops, notation-tag pill eyebrows, and a circle-arrow CTA pattern.

This document records the design decisions for the visual rewrite.

## Goals / Non-Goals

**Goals:**
- Replace the lichen v1 visual system with the Finesse v3 system, using `New Design/styles-v3.css` and `New Design/screens-*-v2.jsx` as the source of truth
- Preserve every server action, DB query, route handler, and migration as-is
- Ship a single coherent design (no hybrid, no toggle)
- Update `theming` capability spec to reflect the new identity
- Keep the dev-only tweaks panel useful (scope it down to what's still configurable)

**Non-Goals:**
- Functional changes of any kind
- Backwards compatibility with the lichen v1 palette
- Accent picker (only one accent: violet)
- Recreating the hand-drawn ink-underline SVG squiggle in any form
- Adding new dependencies

## Decisions

### D1. v3 stylesheet, not v2

`styles-v2.css` and `styles-v3.css` are both present in `New Design/`. v3 is more complete (671 lines vs 577), has dark-mode tokens for `[data-theme="evening"]`, defines a fuller chip variant system, and adds the `.btn-cta` circle-arrow primary pattern. **Adopting v3 verbatim.**

### D2. Black is the hero, not violet

Both v3 and v2 treat **`--ink-deep: rgb(0,0,0)` (effectively black)** as the dominant brand color. Violet is the *accent* — used for hyperlink color, the violet wash radial, and the demo-user avatar circle. Finesse-yellow is the *signature decorative* — used for the AI card's circle, the today-cell on the calendar, the yellow CTA pill variant.

This means buttons that were terracotta in v1 (`var(--accent)`) become black. The "Begin check-in" CTA, the primary submit buttons, the active sidebar nav item — all black. Violet appears for inline links, the active hyperlink hover state, and decorative radial backgrounds.

```
v1                           v3
─────────────────────────────────────────────────────
Primary button   terracotta    black
Active nav item  ink (already black-ish)  black
Inline link      accent-deep   violet
Mood-face select terracotta    black
Progress fill    accent        black
Calendar today   accent        finesse-yellow
AI card bg       accent-tint   ink-deep (full black)
Streak flame     hand-drawn    geometric yellow + red
```

### D3. Three-font stack: Inter / Public Sans / Space Mono

Drop:
- **Inter Tight** — replaced by **Inter** (regular, weights 400-800). Inter Tight's negative tracking is no longer needed because v3 sets letter-spacing per-element (`-0.025em` on display, `-0.005em` on body, `0.16em` on eyebrows).
- **Fraunces** — dropped entirely. The italic display word emphasis ("really", "now", "data") doesn't carry over to Finesse. Replaced by either bolder weight (Inter 700/800) or by a notation-tag pill before the heading.
- **JetBrains Mono** — replaced by **Space Mono**. Both are fixed-width with tabular numerals; Space Mono has heavier strokes that read better in the v3 small-caps eyebrow style.

The Google Fonts URL becomes:

```
https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800
                                &family=Public+Sans:wght@400;500;600;700
                                &family=Space+Mono:wght@400;700
                                &display=swap
```

Body uses `Public Sans` (slightly softer than Inter at body size). Display headings use `Inter`. Mono uses `Space Mono`.

### D4. Page-wash is the signature

Every page that has a header (dashboard, mood, insights, badges, chat, settings) opens with a `.page-wash` block:

```css
.page-wash {
  position: relative;
  background:
    radial-gradient(80% 90% at 70% 0%, var(--wash-yellow) 0%, transparent 60%),
    radial-gradient(70% 110% at 12% 0%, var(--wash-violet) 0%, transparent 55%),
    var(--paper);
  border-bottom: 1px solid var(--line);
  padding: 36px 36px 28px;
}
```

This is the most recognizable single visual element of v3. Every `(app)/*` page uses it. The onboarding stage also uses a related radial-gradient background (`.onboard-stage`).

### D5. The `notation-tag` replaces `t-eyebrow`

v1 used a small uppercase mono label (`.t-eyebrow`) above headings. v3 introduces `.notation-tag` — same size and uppercase, but rendered as a **pill** with a 1px black border. It also has a `.notation-tag-soft` variant with a muted border for less-prominent eyebrows.

```
.notation-tag                .notation-tag-soft
┌──────────────────┐         ┌─ ─ ─ ─ ─ ─ ─ ─ ─┐
│  TUE · MAY 03    │           STEP 1 / 5      
└──────────────────┘         └─ ─ ─ ─ ─ ─ ─ ─ ─┘
border: 1px solid #000       border: 1px solid line-strong
color: ink-deep              color: ink-soft
```

Existing `.t-eyebrow` is kept (still used inside cards, where the pill would be too heavy) but most page-level eyebrows become `.notation-tag`.

### D6. The `.btn-cta` circle-arrow CTA

Signature button — large pill with text + a filled inverse circle holding an arrow icon. Used for the dashboard's "Open chat" link inside the AI card (with `.btn-cta-yellow` for finesse-yellow background) and possibly for the onboarding "Let's begin" final step.

```
┌─────────────────────────┐
│  Open chat       ⬈     │   ← yellow bg, black arrow circle
└─────────────────────────┘
```

### D7. Dashboard: 4-stat grid + ink AI card + habits-checkbox + calendar

Reverting the critique-era restructure. The v2 dashboard layout is:

```
┌───────────────────── PAGE WASH (yellow + violet radial) ──────────┐
│   ┌─ NOTATION PILL ─┐                          [Begin check-in]   │
│   │ TUE · MAY 03    │   Good evening, Maya.    [Talk to companion]│
│   └─────────────────┘   Five minutes when you're ready.           │
└───────────────────────────────────────────────────────────────────┘

┌──────────────┬───────────────┬──────────────┬─────────────────┐
│   Streak     │   Level       │  Mood today  │  Mood · 7d      │
│   🔥 12d     │  130 / 200    │   🙂 Good    │  ▁▁▃▅▃▆█        │
│   BEST · 18d │   L3          │   RIGHT NOW  │  M T W T F S S  │
└──────────────┴───────────────┴──────────────┴─────────────────┘

┌──────────────────── INK CARD (black bg) ──────────┐ ┌───────────┐
│  ✦ COMPANION NOTE                                  │ │ Today's   │
│                                                    │ │ habits    │
│  "Three days of meditation in a row — the          │ │           │
│   shape of a practice is showing up."              │ │ ☐ Drink   │
│                                                    │ │ ☐ Exercise│
│  — LICHEN AI            [Open chat ⬈ ]            │ │ ☐ Read    │
└────────────────────────────────────────────────────┘ └───────────┘
                          (yellow circle decoration top-right)

┌────────────────────── Calendar · May 2026 ───────────────────────┐
│   S  M  T  W  T  F  S                                            │
│   ▢  ▢  ▢  ■  ■  ■  ■    [color = filled black for "done"]      │
│   ▢  ▢  ▢  ▢  ▢  ▢  □    [yellow bordered for "today"]          │
└──────────────────────────────────────────────────────────────────┘
```

Day-1 special case removed. Empty cards on day 1 read fine in this aesthetic because the data-table look treats zero values as just data, not as failure.

### D8. Insights: 4-stat row + completion bars + correlation card + sparkline

Reverts the critique-era editorial paragraph. The v2 prototype's insights screen has:

```
┌────────┬────────┬────────┬────────┐
│ Best   │ Most   │ Refl.  │ Total  │
│ day    │ consis │ count  │ XP     │
│ Tue    │ Medi-  │  17    │  430   │
│ 4.2    │ tate   │        │  L3    │
│        │ 92%    │        │        │
└────────┴────────┴────────┴────────┘

┌─ Habit completion · last 30d ───────┐ ┌─ Correlation ──────┐
│ Meditate     ▓▓▓▓▓▓▓▓▓▓▓ 92%        │ │ On meditate days,  │
│ Exercise     ▓▓▓▓▓▓▓     65%        │ │ avg mood is 4.2.   │
│ Walk         ▓▓▓▓▓▓▓▓    78%        │ │                    │
└─────────────────────────────────────┘ │ Skipping sleep     │
                                        │ early drops next-  │
┌─ Mood trend · 30 days ──────────────┐ │ day mood by 0.6.   │
│   ▁▁▂▂▃▅▄▅▆▇█▇▆▅▆▇▆▇▆▆█             │ └────────────────────┘
└─────────────────────────────────────┘
```

The placeholders for "need 7+ days" and "correlations unlock at 14 days" are kept — both in v3 spirit and per the existing capability spec.

### D9. Tweaks panel: theme-only

The v1 tweaks panel had:
- 5 accents (terracotta / ochre / sage / plum / ink)
- 2 themes (warm / evening)
- skipOnboarding toggle
- Replay onboarding button
- Jump-to-flow buttons

In Finesse v3, accents are gone. The new tweaks panel keeps:
- 2 themes (warm / evening)
- Demo-user impersonation buttons (login as fresh / mid / power)
- Jump-to-flow buttons (begin check-in, see AI message)

The `lichen.accent` localStorage key is ignored (no accent picker, no presets). The `lichen.theme` key is still read on boot. `applyTheme()` no longer takes an accent argument.

### D10. Mood / habit / status / icon details

- Mood faces unchanged (5 emoji), but the selected state goes from "terracotta accent fill + box-shadow ring" to "ink-deep solid fill + scale 1.05" (v3).
- The flame stamp drops the hand-drawn warbly path and uses a more geometric shape filled with `--yellow rgb(255,218,68)` and a red flame core. Re-stylized but still SVG.
- Status colors: `--good rgb(18,183,106)`, `--warn rgb(233,162,59)`, `--error rgb(216,0,39)`, `--info rgb(51,138,243)` — all paired with soft pastel backgrounds. New `chip-red`/`chip-yellow`/`chip-green`/`chip-violet`/`chip-ink` variants available for status pills.
- Sparkline default color shifts from terracotta to violet (`rgb(123,97,255)`).

### D11. Dropping `.ink-underline` and Fraunces italic emphasis

The v1 pattern of `<span className="ink-underline">data</span>` (rendering a hand-drawn SVG squiggle under italic Fraunces) is removed. Replacement strategy:

- For headings that had italic emphasis (e.g. "How are you, *really*?"): just bold the word in the body font ("How are you, **really**?") or drop the emphasis entirely
- For the calendar / page titles that had a Fraunces italic display word: use Inter 700/800 with the existing letter-spacing
- The `.h-display` class keeps its name but rebinds to Inter weight 700 instead of Fraunces italic

This is the most lossy single change. The italic display word was a real piece of voice work. The replacement is functional but flatter. Documented as a known trade-off — if the result feels too flat in practice, a v3.1 follow-on could re-introduce a single italic display face (e.g., Inter Italic at large sizes only).

### D12. `loading.tsx` skeleton restyle

The skeleton (rendered while a route compiles) uses bars in `--line-soft` and a paper-warm card placeholder. In Finesse, switch to:
- Top: a notation-tag pill skeleton (small dark rectangle)
- Below: page-title bar in `--ink-deep` 10% opacity
- Below: page-subtitle bar in `--ink-mute` 30% opacity
- Below: a sharp `--paper` card with `--line` border

So even the loading state communicates the new aesthetic.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `[Visual regression]` — every page changes simultaneously, no incremental rollout | Build manually verifies all 9 screens; OpenSpec specs/theming spec gate behavior |
| `[Lost voice work]` — Fraunces italic emphasis on "really"/"now"/"data" is gone | Documented in D11. If too flat, follow-on can add a single display italic face |
| `[Day-1 UX degradation]` — full 4-stat grid with zeros on first day | Accepted. v3's data-table aesthetic treats zeros as data, not as failure-to-fill |
| `[Critique-pass reversals]` — kills the editorial /insights paragraph and the lone-card day-1 dashboard | Both are intentional. Context governs whether a 4-stat row is "slop" or "right" |
| `[localStorage stale]` — users with `lichen.accent` saved | Ignored on read; `applyTheme` no longer reads it |
| `[Turbopack cache pollution]` after CSS rewrite | Required step: `rm -rf .next` once before first dev/build after merge |
| `[Production bundle bloat]` — three new font families | Same number of fonts as before (3). Total weight comparable |

## Migration Plan

1. Land all CSS + component changes in a single PR — no incremental aesthetic mixing
2. After merge, devs/contributors run `rm -rf .next` once locally
3. No data migration. No DB changes. No env changes.
4. Demo seed unchanged (still seeds `demo-fresh / demo-mid / demo-power`)
5. Smoke test: log in as `demo-power`, walk every authed route, verify the page-wash gradient renders, the 4-stat dashboard fills in, the AI card is the black variant with a yellow circle decoration

Rollback: revert the PR. No data state is touched.

## Open Questions

- **Should the ink AI card on dashboard appear when no AI message exists yet?** v2 shows it always. The current implementation only shows the AI suggestion card when `today.ai_message` exists; otherwise it shows a generic greeting. Decision: keep current behavior (show greeting in the ink card when no message). The card structure is the same, only the text differs.
- **Onboarding final step** — v2 renders the final step inside the same `.onboard-card`. Should it use the `.btn-cta` circle-arrow primary or just `.btn-primary`? Recommend `.btn-cta` for the "Finish setup" button to introduce the pattern early.
- **Italic emphasis fallback** — does the user want any italic display moments preserved, or fully drop? Drafting with full drop, easy to add back if desired.
