## ADDED Requirements

### Requirement: Dashboard composition

The system SHALL render `/dashboard` as a server component composing seven cards in this order:

1. Personal details — name, time-of-day greeting, current level
2. Current streak — number, flame icon, "Longest streak: X days" sub-text
3. Current XP — progress bar (`xp_in_level / xp_for_next_level`), total XP earned
4. Mood tracker — today's mood emoji (or "Log mood" CTA), 7-day mood trend
5. AI suggestion — one personalized message, refreshed daily or after each check-in
6. Calendar streak — month view, days color-coded
7. Daily check-in CTA — "Check In" button, or disabled "✓ Checked in today" if today's check-in exists

#### Scenario: Authenticated user with no check-ins lands on dashboard
- **WHEN** a user with `onboarding_completed = 1` and zero `check_ins` rows visits `/dashboard`
- **THEN** the system renders all seven cards
- **AND** streak shows 0, level 1, XP 0
- **AND** mood tracker shows "Log mood"
- **AND** the calendar shows the current month with all days neutral
- **AND** the check-in CTA is enabled

### Requirement: Derived stats are computed on read

The system SHALL compute `currentStreak`, `longestStreak`, `totalXp`, `level`, `xpInLevel`, and `xpForNextLevel` from the user's `check_ins` rows on every dashboard load. The system SHALL NOT persist these values in any table.

#### Scenario: Streak computation
- **WHEN** the dashboard loads for a user
- **THEN** `currentStreak` is the count of consecutive calendar days ending at today or yesterday with a `check_ins` row
- **AND** `longestStreak` is the maximum such run anywhere in the user's history

#### Scenario: Streak breaks if a day is missed
- **WHEN** a user has check-ins on 2026-04-29, 2026-04-30, and 2026-05-02 (skipped 2026-05-01) and today is 2026-05-02
- **THEN** `currentStreak` is 1
- **AND** `longestStreak` is 2

#### Scenario: Today missing but yesterday present
- **WHEN** today is 2026-05-03 and the user's last check-in was 2026-05-02
- **THEN** `currentStreak` reflects the run ending on 2026-05-02 (not yet broken)

#### Scenario: Two missed days breaks streak
- **WHEN** today is 2026-05-03 and the user's last check-in was 2026-05-01
- **THEN** `currentStreak` is 0

### Requirement: Calendar day color coding

Each day in the calendar view SHALL be color-coded as:
- **Blue** — today
- **Green** — has a check-in with all habit answers `yes`
- **Yellow** — has a check-in with at least one `partial` or mixed answers
- **Gray** — past day with no check-in
- **Neutral / unstyled** — future days

#### Scenario: User taps a past green day
- **WHEN** the user taps a calendar day with a check-in
- **THEN** the system shows that check-in's details (mood, habits, reflection) in a modal or detail view

### Requirement: AI suggestion freshness

The dashboard's AI suggestion card SHALL display a message that is regenerated only on:
- Day rollover (new local date)
- After each check-in submission

It SHALL NOT regenerate on every dashboard load. The current message is cached in the user's most recent `check_ins.ai_message`, or a generic default if no check-in exists today.

#### Scenario: User reloads dashboard mid-day
- **WHEN** a user who already checked in today reloads `/dashboard`
- **THEN** the AI suggestion shown is the same message stored on today's check-in
- **AND** no new Claude call is made
