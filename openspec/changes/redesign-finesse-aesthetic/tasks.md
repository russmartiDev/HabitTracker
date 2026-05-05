## 1. Foundation — globals.css and fonts

- [x] 1.1 Replace contents of `app/globals.css` with `New Design/styles-v3.css`, adjusting the `@import url(...)` Google Fonts URL to load Inter / Public Sans / Space Mono
- [x] 1.2 Update `app/layout.tsx` if any font preconnect / preload hints reference the old Inter Tight + Fraunces + JetBrains Mono URL
- [x] 1.3 Verify the new CSS compiles (no syntax errors, no missing references). Hard-refresh dev once after replacement
- [x] 1.4 Drop the `paper-grain` `body::before` SVG turbulence — it's removed from v3
- [x] 1.5 Confirm `[data-theme="evening"]` token block is preserved end-to-end

## 2. Layout primitives + sidebar

- [x] 2.1 Update `app/(app)/layout.tsx` — sidebar gap/padding tighten per v3 (`padding: 22px 14px`), profile card structure stays but gets the violet circle avatar style
- [x] 2.2 Rewrite `components/Sidebar.tsx` — outline-rectangle nav items always visible (`border: 1px solid var(--line-strong)`), active state uses `--ink-deep` solid black, profile card at bottom uses violet circle for the user initial + flame emoji
- [x] 2.3 Drop the `useLinkStatus()` pulsing dot — v3's outline-rect already gives strong visual feedback (decision: keep pending dot but restyle as a small black dot)
- [x] 2.4 Mobile sidebar collapse: keep the existing `@media (max-width: 760px)` rule but verify it still works with the outline-rect style

## 3. Dashboard

- [x] 3.1 Rewrite `app/(app)/dashboard/page.tsx` to follow `New Design/screens-dashboard-v2.jsx` structure: `.page-wash` header → 4-stat grid → asymmetric ink AI card + habits checkboxes → calendar
- [x] 3.2 Remove the day-1 collapsed-card special case (the early-return for `daysActive === 0`)
- [x] 3.3 Implement the ink AI card: black background, finesse-yellow circle decoration top-right, yellow CTA pill linking to `/chat` with a circle-arrow
- [x] 3.4 Implement the habits row: each habit as a row with icon-tile (violet-tinted) + label + checkbox (filled green on `done`, outlined on pending)
- [x] 3.5 Calendar cell colors per v3: filled black for `done`, outlined-black for `partial`, paper-warm for `missed`, finesse-yellow with double-shadow ring for `today`
- [x] 3.6 Date eyebrow becomes a `.notation-tag` pill above the greeting

## 4. Insights

- [x] 4.1 Rewrite `app/(app)/insights/page.tsx` to use the v2 layout: 4-stat row → habit completion bars + correlation card (1.4fr/1fr) → 30-day mood sparkline
- [x] 4.2 Remove the editorial Fraunces-italic running paragraph added during the critique pass
- [x] 4.3 Sparkline color → violet (`rgb(123,97,255)`)
- [x] 4.4 Correlation card uses `.card-warm` background with body text (no italic)
- [x] 4.5 Placeholders for "Need 7+ days" / "Correlations unlock at 14 days" remain — but use plain body type, not italic display

## 5. Mood log

- [x] 5.1 Update `app/(app)/mood/page.tsx` and `components/MoodLogForm.tsx` per v2: page-wash header, sharp mood-face buttons (selected = solid black fill + scale), heatmap colors using `--good-soft` / `--warn-soft` / etc (status-color pastels)
- [x] 5.2 Tag chips use `.chip` (active = ink-deep solid)

## 6. Check-in flow + AI message

- [x] 6.1 Rewrite `components/CheckInForm.tsx` per `New Design/screens-checkin-v2.jsx`: notation-tag pill eyebrows on each step, sharp option buttons (`.optBtn` style — `--paper` default, `--ink-deep` solid when selected), Space Mono progress bar
- [x] 6.2 Rewrite `app/(app)/checkin/done/page.tsx`: page-wash with companion-note header, ink AI card with the message, summary stats in `.t-eyebrow`+stat-num pairs, `.btn-cta` "Continue to dashboard"
- [x] 6.3 Crisis banner uses `.chip-red` + `--error-soft` background

## 7. Chat

- [x] 7.1 Update `app/(app)/chat/page.tsx` and `components/ChatInterface.tsx`: page-wash header, chat bubbles per v3 (`--paper-warm` for AI with bottom-left-radius 4px, `--ink-deep` for user with bottom-right-radius 4px), input row uses sharp `.input` + black `.btn-primary` send button
- [x] 7.2 Disclaimer above input remains (per ai-coaching spec)

## 8. Badges

- [x] 8.1 Update `app/(app)/badges/page.tsx` with v3 `.badge-tile` style: `--paper` background, `--line` border, `.badge-icon` 56×56 with `--paper-warm` background + `--line` border, locked variant uses `opacity: 0.5` + `filter: grayscale(1)`
- [x] 8.2 Page header uses `.page-wash` with notation-tag eyebrow

## 9. Settings

- [x] 9.1 Update `app/(app)/settings/page.tsx` per v3: page-wash header, profile section uses sharp `.input` for name + `.chip` row for tone selection
- [x] 9.2 `components/SettingsThemePicker.tsx` — drop accent picker section entirely; only theme (warm/evening) chips remain
- [x] 9.3 `components/SettingsProfileForm.tsx` — sharp inputs, chip-row tone selector
- [x] 9.4 Reset button keeps the danger-zone card style; armed state uses `--error` color
- [x] 9.5 Logout button kept

## 10. Onboarding

- [x] 10.1 Update `app/(app)/onboarding/page.tsx` and `components/OnboardingFlow.tsx` per v2: `.onboard-stage` background gradient (yellow + violet radial), `.onboard-card` with shadow-lg, notation-tag eyebrow on each step, dot-row progress unchanged
- [x] 10.2 Final step CTA uses `.btn-cta` with the circle-arrow icon (introduces the pattern early)
- [x] 10.3 Auth pages (`/login`, `/signup`) use `.onboard-stage` + `.onboard-card`; intro copy stays

## 11. Components — visual.tsx + Icon.tsx

- [x] 11.1 Update `components/visual.tsx` — `Sparkline` default color → `rgb(123,97,255)` violet; `FlameStamp` rewritten geometric (yellow fill `rgb(255,218,68)`, ink stroke, red core flame) per v3 components
- [x] 11.2 Add icons referenced in v3: `chevron-right`, `envelope`, `bolt` (others unchanged)
- [x] 11.3 Remove `Squiggle` SVG export (was the hand-drawn ink underline component) if unused after the rewrite

## 12. Tweaks panel

- [x] 12.1 Rewrite `components/TweaksPanel.tsx` — drop accent picker section, keep theme picker (warm/evening), add demo-user impersonation buttons (calls `signIn('credentials', ...)` with each demo email/password), keep jump-to-flow buttons
- [x] 12.2 Update `components/ThemeApplier.tsx` — remove `ACCENT_PRESETS` map, remove accent CSS variable updates; only apply `data-theme` and store `lichen.theme`
- [x] 12.3 Remove `lichen.accent` localStorage references everywhere

## 13. Loading skeleton

- [x] 13.1 Update `app/(app)/loading.tsx` — restyle bars + card to match v3 (notation-tag pill bar + page-title bar in `--ink-deep` 10% opacity + body bar + sharp paper card)

## 14. XP animation

- [x] 14.1 Update `components/XpAnimation.tsx` — pill chip → `--accent-soft` background with `--accent-deep` text, finesse-yellow could replace if more striking; sparkles icon stays

## 15. Microcopy / italic-emphasis fallback

- [x] 15.1 Walk every component for `<span className="ink-underline">word</span>` and replace with `<strong>word</strong>` or remove the emphasis entirely
- [x] 15.2 Walk for `<span className="h-display" style={{...}}>word</span>` (italic Fraunces emphasis on dashboard / mood / chat); replace with bolder Inter weight or remove
- [x] 15.3 Reflect this in voice-related microcopy strings — the Finesse aesthetic reads slightly more curt, bring page-subtitles down to fewer words where possible

## 16. Verification

- [x] 16.1 `rm -rf .next && npx tsc --noEmit` — no errors
- [x] 16.2 `npm run build` — succeeds clean; production bundle audit confirms no `Fraunces`, no `oklch(0.62 0.14 40)` terracotta token, no `ink-underline::after`
- [x] 16.3 Manual smoke: `demo-power@lichen.local` / `demo` → `/dashboard` shows page-wash + 4 stat cards + ink AI card with yellow circle + habits-checkbox row + calendar
- [x] 16.4 Manual smoke: `demo-fresh` (after primed) → `/dashboard` shows full grid with zeroed stats (no day-1 special case)
- [x] 16.5 Manual smoke: every authed route renders with `.page-wash` header
- [x] 16.6 Manual smoke: tweaks panel offers theme + demo impersonation only — no accent picker
- [x] 16.7 Evening theme works on every page (toggle in tweaks panel)
- [x] 16.8 Update `lichen/README.md` design-decisions section to reflect Finesse identity
