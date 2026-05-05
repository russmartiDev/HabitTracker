## ADDED Requirements

### Requirement: Insights page

The system SHALL render `/insights` with the following sections:

1. Habit completion rate per active habit (last 7 days, last 30 days)
2. Mood trend line over the last 30 days
3. Best day of week (highest average mood)
4. Most consistent habit (highest 30-day completion rate)
5. Total reflections written count
6. Link to the badge gallery

#### Scenario: User with 30+ days of data views insights
- **WHEN** a user with check-ins spanning 30+ days visits `/insights`
- **THEN** all six sections render with computed values

#### Scenario: New user with insufficient data
- **WHEN** a user with fewer than 7 days of check-ins visits `/insights`
- **THEN** sections requiring more data display "Need more check-ins to show this" placeholders
- **AND** sections that work with partial data render normally

### Requirement: Mood tracker

The system SHALL provide a `/mood` page where users can log mood up to 5 times per day, optionally with tags (`work`, `family`, `sleep`, `social`, `health`) and a one-line note.

Mood logs SHALL be stored in `mood_logs` separately from check-in mood. Today's first mood log MAY auto-populate the check-in mood.

#### Scenario: User logs mood from /mood
- **WHEN** a user submits the mood form with mood 4 and tag `work`
- **THEN** the system inserts a `mood_logs` row
- **AND** redirects to `/dashboard`
- **AND** the dashboard mood card reflects the new mood

#### Scenario: User exceeds 5 mood logs in a day
- **WHEN** a user attempts to submit a 6th mood log within the same calendar day
- **THEN** the system rejects with "You've logged your mood 5 times today — see you tomorrow"
- **AND** does not insert a new row

### Requirement: Mood-habit correlation

When the user has at least 14 days of check-ins, the system SHALL compute and display correlation summaries: average mood on days a given habit was completed (`yes`) vs days it was not (`no` | `partial` | absent).

#### Scenario: Exercise correlation displayed
- **WHEN** a user with 14+ days of data visits `/insights` and "Exercise" has both completed and not-completed days
- **THEN** the system displays "On exercise days, your average mood is X.X (vs Y.Y on other days)"

#### Scenario: Insufficient data hides correlation
- **WHEN** a user has fewer than 14 days of check-ins
- **THEN** correlation summaries are hidden
- **AND** a placeholder "Correlations unlock at 14 days" is shown
