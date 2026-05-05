## ADDED Requirements

### Requirement: Lichen visual identity preserved

The application SHALL preserve the visual identity of the `Design/` prototype:

- Brand name: **lichen**
- Default accent: **terracotta**
- Selectable accents: `terracotta` | `ochre` | `sage` | `plum` | `ink`
- Themes: `warm` (default, cream paper) | `evening` (dark mode)
- Color tokens MUST use OKLCH per `Design/styles.css`
- Typography, sidebar layout, card chrome, and progress bar styles MUST match the prototype

The CSS in `Design/styles.css` SHALL be the source of truth and SHALL be ported to `app/globals.css` largely verbatim.

#### Scenario: Default render matches prototype
- **WHEN** an authenticated user with no theme preference loads the dashboard
- **THEN** the page renders with `data-theme="warm"` and terracotta accent
- **AND** the sidebar, cards, and typography visually match the prototype

### Requirement: User-selectable accent and theme

Settings SHALL let the user pick one accent (5 options) and one theme (2 options). The selection SHALL persist to the user's record (e.g., `users.theme`, `users.accent` columns added in a follow-on change, or to `localStorage` for v1) and SHALL apply on every page load.

For v1, the selection MAY be stored in `localStorage` keyed by `userId` to keep schema simple; document this as a v1 limitation.

#### Scenario: User picks sage accent
- **WHEN** a user selects "Sage" in settings
- **THEN** subsequent page loads render with `data-accent="sage"`
- **AND** all `--accent`, `--accent-deep`, `--accent-soft`, `--accent-tint` CSS custom properties update accordingly

#### Scenario: User switches to evening theme
- **WHEN** a user toggles theme to "Evening"
- **THEN** `<html data-theme="evening">` is set
- **AND** all surfaces use the evening palette

### Requirement: Dev-only tweaks panel

The system SHALL include the prototype's tweaks panel as a client component mounted only when `process.env.NODE_ENV !== 'production'`. The panel SHALL allow:

- Switching accent
- Switching theme
- Switching the active "demo" user (only in dev — signs out and signs in as `demo-fresh`, `demo-mid`, or `demo-power`)
- Jumping to the check-in or AI message screen with stub data
- Replaying onboarding (resets `onboarding_completed` for the current dev user)

In production builds the panel SHALL NOT be loaded into the user's browser. The dynamic-import chunk file may exist in build output, but the `(app)/layout.tsx` gate evaluates to `null` at module load time (statically determined by `NODE_ENV`) so the chunk is never requested.

#### Scenario: Dev mode shows the panel
- **WHEN** the app runs with `NODE_ENV=development`
- **THEN** the tweaks panel renders in the bottom corner of every authenticated page

#### Scenario: Production mode omits the panel
- **WHEN** the app runs with `NODE_ENV=production`
- **THEN** no tweaks panel is rendered on any page
- **AND** no tweaks-panel chunk is loaded into the user's browser by any route

### Requirement: Demo accounts seeded

The system SHALL seed three demo accounts at first migration with passwords all set to `demo`:

- `demo-fresh@lichen.local` — Day 1 (no check-ins)
- `demo-mid@lichen.local` — 12 days of varied check-ins seeded
- `demo-power@lichen.local` — 60 days of check-ins seeded, multiple badges earned

Demo accounts SHALL exist in production builds but the dev-only tweaks panel SHALL be the only UI surface that exposes them.

#### Scenario: Demo accounts available after fresh install
- **WHEN** the app boots for the first time and runs migrations
- **THEN** three demo users exist with the seed data above
- **AND** logging in as `demo-power@lichen.local` with password `demo` shows a populated dashboard with badges
