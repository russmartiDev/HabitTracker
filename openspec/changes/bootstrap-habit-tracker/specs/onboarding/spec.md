## ADDED Requirements

### Requirement: First-run onboarding gate

The system SHALL redirect any authenticated user with `onboarding_completed = 0` to `/onboarding` from any `(app)/*` route except `/onboarding` itself.

#### Scenario: New user lands on dashboard
- **WHEN** a freshly signed-up user with `onboarding_completed = 0` requests `/dashboard`
- **THEN** the system redirects to `/onboarding`

#### Scenario: Completed user accesses onboarding
- **WHEN** a user with `onboarding_completed = 1` requests `/onboarding`
- **THEN** the system redirects to `/dashboard`

### Requirement: Four-question profiling flow

The onboarding flow SHALL collect four pieces of profiling information in sequence (the user's name was already collected at signup). Each question MUST be skippable except habit selection, which requires at least one habit.

The four questions are:
1. **Main goal** — single select: `health` | `productivity` | `mental_wellness` | `learning` | `relationships`
2. **Active time** — single select: `morning` | `afternoon` | `evening` | `night`
3. **Habits to build** — multi-select from a fixed template list (Drink water, Exercise, Read, Meditate, Sleep early, Journal, Walk, Limit screen time, Cook at home, Stretch) plus a free-text custom entry. At least one habit MUST be selected.
4. **Communication preference** — single select: `encouraging` | `direct` | `playful`

#### Scenario: User completes onboarding
- **WHEN** a user submits all four answers with at least one habit selected
- **THEN** the system writes `goal`, `active_time`, `communication_pref` to the `users` row
- **AND** writes one `habits` row per selected habit with `archived = 0`
- **AND** sets `onboarding_completed = 1`
- **AND** redirects to `/dashboard`

#### Scenario: User submits zero habits
- **WHEN** a user reaches the habit-selection step and submits with no habits selected
- **THEN** the system shows a validation error "Pick at least one habit to track"
- **AND** does not advance the flow

#### Scenario: User adds a custom habit
- **WHEN** a user types a custom habit name (1–60 chars) and submits
- **THEN** the system stores it as a `habits` row with `type = 'binary'` and `name` set to the user input

### Requirement: Onboarding is one-way in v1

The system SHALL NOT provide a way to re-run onboarding from within the app in v1. Settings MAY allow editing individual fields (name, communication_pref) but not the full flow.

#### Scenario: User wants to redo onboarding
- **WHEN** a user looks for "redo onboarding" in settings
- **THEN** no such control exists
- **AND** individual editable fields (name, communication preference) are available instead
