## REMOVED Requirements

### Requirement: Lichen visual identity preserved

**Reason**: Replaced by the Finesse documentation-system identity in this change. The cream/paper canvas + terracotta-accent + Fraunces italic system is being retired wholesale.

**Migration**: All references to `--accent` set via OKLCH terracotta/sage/ochre/plum/ink presets, the `.ink-underline` SVG squiggle pseudo-element, and the Fraunces font family are removed. See ADDED requirement "Finesse visual identity".

### Requirement: User-selectable accent and theme

**Reason**: Accent is no longer user-selectable. Finesse defines a single accent (violet) used as a hyperlink and decorative color. The theme axis (warm/evening) survives.

**Migration**: Settings UI's accent picker is removed. The `lichen.accent` localStorage key is ignored on read and may be safely deleted by clients. Theme picker (warm/evening) remains.

## ADDED Requirements

### Requirement: Finesse visual identity

The application SHALL adopt the Finesse documentation-system aesthetic defined by `New Design/styles-v3.css`:

- **Canvas**: white parchment (`rgb(252,253,250)` for canvas, pure white `rgb(255,255,255)` for paper). No paper-grain noise.
- **Hero color**: black (`rgb(15,23,42)` for `--ink`, `rgb(0,0,0)` for `--ink-deep`). Black is the dominant brand color used for primary buttons, active sidebar items, progress fills, AI card backgrounds, and stat numerals.
- **Accent**: violet (`rgb(123,97,255)` for `--accent`, `rgb(89,67,205)` for `--accent-deep`). Used for inline hyperlinks, the violet wash radial, the demo-user avatar, and accent-tinted hover states.
- **Signature decorative**: finesse-yellow (`rgb(255,237,107)`). Used for the AI card decoration circle, the today cell on the calendar, the inverted CTA pill, and the geometric flame stamp fill.
- **Typography**: Inter (display, weights 400-800), Public Sans (body, 400-700), Space Mono (monospace numerals + eyebrow labels). Fraunces is removed.
- **Radii**: 6px standard, 4px small, 10px large, 999px pill. Sharper than v1's 14px standard.
- **Shadows**: Four-step scale (`--shadow-sm` through `--shadow-xl`) using neutral RGB shadows.

The CSS in `New Design/styles-v3.css` SHALL be ported into `app/globals.css` substantially verbatim, with adjustments only for path conventions and any Next.js-specific token references.

#### Scenario: Default render uses the Finesse identity
- **WHEN** a user with no theme preference loads any authed page
- **THEN** the page renders with `data-theme="warm"` and the Finesse white canvas
- **AND** primary CTAs render in black with white text
- **AND** the page header renders inside a `.page-wash` block with a subtle yellow-and-violet radial gradient

#### Scenario: No accent picker is shown
- **WHEN** a user opens `/settings`
- **THEN** no UI exposes an accent color choice
- **AND** the appearance section offers only theme (warm/evening)

### Requirement: Page-wash header treatment

Authed pages with a primary header SHALL render the header inside a `.page-wash` element — a paper-colored container with two layered radial gradients (yellow centered upper-right, violet upper-left) and a 1px bottom border. The page body content sits below the wash inside `.page-body`.

Pages affected: `/dashboard`, `/insights`, `/badges`, `/mood`, `/chat`, `/settings`. The check-in flow and onboarding use `.onboard-stage` (which carries its own gradient background) instead of `.page-wash`.

#### Scenario: Dashboard renders with page-wash
- **WHEN** an authenticated user loads `/dashboard`
- **THEN** the top of the page contains a `.page-wash` block with the yellow + violet radial gradient backdrop
- **AND** below the wash, a `.page-body` container holds the metric grid, AI card, habits row, and calendar

### Requirement: Notation-tag eyebrow

Page-level eyebrow labels above main headings SHALL use a `.notation-tag` — a small uppercase Space Mono pill with a 1px black border (`.notation-tag`) or a 1px muted border (`.notation-tag-soft`). The `.t-eyebrow` class remains for inline label use inside cards.

#### Scenario: Dashboard date eyebrow
- **WHEN** the dashboard renders
- **THEN** above the greeting heading there is a `.notation-tag` pill containing the current date (e.g. `TUE · MAY 03`)

### Requirement: Circle-arrow CTA pattern

The system SHALL provide a `.btn-cta` button — a large pill-shaped button with text and a filled inverse circle holding an arrow icon. A `.btn-cta-yellow` variant uses finesse-yellow background with a black arrow circle. This pattern is used for at least:

- The "Open chat" button inside the dashboard's AI card (yellow variant)
- The final "Finish setup" action of onboarding (black variant)

#### Scenario: AI card CTA
- **WHEN** the dashboard's ink AI card renders
- **THEN** the card contains a `.btn-cta-yellow` button labeled "Open chat" with a black circle holding an arrow icon

### Requirement: Theme picker (warm/evening only)

The settings appearance section SHALL allow the user to pick exactly one theme:

- `warm` (default) — white canvas, light wash gradients, black ink hero
- `evening` — dark canvas (`rgb(15,17,21)`), muted wash gradients, near-white ink hero

The theme selection persists in `localStorage` under `lichen.theme` and is applied on every page load via the `<html data-theme="…">` attribute. Both themes share the violet accent and finesse-yellow signature.

#### Scenario: Switching to evening
- **WHEN** the user clicks "Evening" in settings
- **THEN** subsequent renders set `<html data-theme="evening">`
- **AND** all surfaces switch to the dark palette while keeping violet + finesse-yellow accents

### Requirement: Dev-only tweaks panel (scoped)

The dev-only tweaks panel SHALL expose only:

- Theme picker (warm / evening)
- Demo-user impersonation actions (sign in as `demo-fresh@lichen.local`, `demo-mid@lichen.local`, `demo-power@lichen.local`)
- Jump-to-flow shortcuts (begin check-in, view AI message screen with stub data)

The panel SHALL NOT expose an accent picker. In production builds the panel is not loaded into the browser (existing `(app)/layout.tsx` gate via `process.env.NODE_ENV` remains).

#### Scenario: Dev tweaks panel
- **WHEN** the app runs with `NODE_ENV=development`
- **THEN** the bottom-right tweaks panel offers theme picker and demo-user impersonation
- **AND** no accent picker is present

### Requirement: Lichen identity assets removed

The following lichen v1 visual elements SHALL NOT be present anywhere in the application:

- The hand-drawn `.ink-underline` SVG squiggle pseudo-element
- The Fraunces italic font family
- The OKLCH terracotta / sage / ochre / plum accent presets
- Paper-grain SVG noise on `body::before`

#### Scenario: Audit
- **WHEN** the production CSS bundle is searched
- **THEN** no occurrence of "Fraunces", "ink-underline::after", or OKLCH oklch(0.62 0.14 40) terracotta tokens is present
- **AND** no `body::before` paper-grain rule exists
