## ADDED Requirements

### Requirement: One check-in per user per local day

The system SHALL enforce uniqueness on `(user_id, date)` for completed check-ins, where `date` is the calendar date in the user's local timezone at submission time.

#### Scenario: User completes a check-in
- **WHEN** a user submits the check-in form
- **THEN** the system inserts one `check_ins` row with today's local date
- **AND** inserts one `habit_logs` row per active habit answered
- **AND** the dashboard "Check In" button switches to the "Checked in today" disabled state

#### Scenario: User attempts a second check-in same day
- **WHEN** a user who already has a `check_ins` row for today opens `/checkin`
- **THEN** the system displays a "You've already checked in today" view with a link back to dashboard
- **AND** the form is not shown

### Requirement: Check-in question structure

A check-in SHALL collect, in order:

1. **Mood** (required) — integer 1–5 (😞 😐 🙂 😊 🤩)
2. **Habit answers** (up to 3, required if any active habit exists) — for each of up to 3 active non-archived habits, one of:
   - `yes` | `no` | `partial` for binary habits
3. **Reflection** (optional) — free text, 0–500 characters

If the user has fewer than 3 active habits, fewer habit questions SHALL be shown. If the user has zero active habits (impossible after onboarding but defensive), no habit questions are shown.

#### Scenario: User has 5 active habits
- **WHEN** the check-in flow loads for a user with 5 non-archived habits
- **THEN** the system shows habit questions for the 3 most recently created habits
- **AND** the remaining 2 habits do not appear in this check-in

#### Scenario: User leaves reflection blank
- **WHEN** a user submits a check-in with mood and habits filled but reflection empty
- **THEN** the system stores `reflection = NULL`
- **AND** awards no reflection-bonus XP

#### Scenario: User exceeds reflection length
- **WHEN** a user types more than 500 characters into the reflection field
- **THEN** the input prevents further typing
- **AND** displays remaining-character count

### Requirement: XP awarded per check-in

On submit, the system SHALL compute and store `xp_earned` on the `check_ins` row using:

| Action | XP |
|---|---|
| Daily check-in (always) | 10 |
| All habit questions answered (no habits skipped) | +5 |
| Reflection written (≥1 char after trim) | +3 |
| Mood logged | +2 |

Maximum per check-in: 20 XP.

#### Scenario: Full check-in with reflection
- **WHEN** a user submits with mood, all habits answered, and a reflection
- **THEN** `xp_earned` is 20

#### Scenario: Mood-only check-in (zero habits)
- **WHEN** a user with zero active habits submits with only mood
- **THEN** `xp_earned` is 12 (10 + 2)

### Requirement: Grading path selection

The system SHALL pick `algorithmic` or `ai` for each check-in using deterministic rules and SHALL store the result in `check_ins.ai_path`.

The path is `ai` if any of:
- Today is the user's "AI day" (user_id mod 7 mapped to a day of week, fixed at user creation)
- The check-in causes a level-up (post-XP crosses a level boundary)
- The trailing 3 check-ins (including this one) all have `mood ≤ 2`

Otherwise the path is `algorithmic`.

If `ANTHROPIC_API_KEY` is missing OR the Claude call errors OR the user has triggered AI more than 10 times in the trailing 7 days, the system SHALL fall back to `algorithmic` and SHALL store the original intended path was `ai` in a log but persist `ai_path = 'algorithmic'`.

#### Scenario: Normal weekday check-in
- **WHEN** a user with healthy mood and no level-up checks in on a non-AI-day
- **THEN** `ai_path = 'algorithmic'`
- **AND** no Claude call is made

#### Scenario: Level-up triggers AI
- **WHEN** a user's check-in causes their XP to cross a level boundary
- **THEN** `ai_path = 'ai'`
- **AND** the system calls Claude for a personalized message

#### Scenario: Low-mood streak triggers AI
- **WHEN** the user's last 3 check-ins (including this one) all have `mood ≤ 2`
- **THEN** `ai_path = 'ai'`

#### Scenario: API key missing falls back gracefully
- **WHEN** `ai_path` would be `ai` but `ANTHROPIC_API_KEY` is unset
- **THEN** the system uses the algorithmic message
- **AND** `ai_path` is stored as `algorithmic`
- **AND** the check-in completes successfully

### Requirement: Post-submit AI message screen

After a check-in submit, the system SHALL show an "AI Message" screen with:
- The personalized message (algorithmic template or Claude output)
- An XP-earned animation showing `+N XP`
- A list of any newly-unlocked badges
- A "Continue to Dashboard" button

#### Scenario: User finishes a check-in
- **WHEN** the check-in submit succeeds
- **THEN** the system navigates to the AI message screen
- **AND** displays the message, xp gain, and any new badges
- **AND** the "Continue" button returns the user to `/dashboard`
