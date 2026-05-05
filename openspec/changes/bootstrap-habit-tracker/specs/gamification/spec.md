## ADDED Requirements

### Requirement: Level curve

The system SHALL compute level from cumulative XP using:

- Level 1 → 2: 50 XP
- Level 2 → 3: 120 XP (cumulative)
- Level N → N+1: previous threshold + (70 × N) XP cumulative

`xpInLevel` is `totalXp - threshold(level)`. `xpForNextLevel` is `threshold(level + 1) - threshold(level)`.

#### Scenario: New user
- **WHEN** a user has 0 total XP
- **THEN** `level = 1`, `xpInLevel = 0`, `xpForNextLevel = 50`

#### Scenario: User crosses Level 1 → 2
- **WHEN** a user's total XP becomes 50
- **THEN** `level = 2`, `xpInLevel = 0`, `xpForNextLevel = 70`

#### Scenario: Mid-level user
- **WHEN** a user has 90 total XP
- **THEN** `level = 2`, `xpInLevel = 40`, `xpForNextLevel = 70`

### Requirement: 15 seeded badges

The system SHALL seed 15 badges at first-run migration with the following codes and trigger rules:

| Code | Name | Trigger |
|---|---|---|
| `first_step` | First Step | First check-in completed |
| `week_warrior` | Week Warrior | 7-day streak reached |
| `monthly_master` | Monthly Master | 30 check-ins within any rolling 30-day window |
| `comeback_kid` | Comeback Kid | Resume check-ins after a 3+ calendar-day gap |
| `mood_mapper` | Mood Mapper | Mood logged on 7 distinct days |
| `honest_heart` | Honest Heart | Submit a check-in with `mood ≤ 2` AND non-empty reflection |
| `habit_hero` | Habit Hero | Any single habit completed (`status = 'yes'`) 21 times |
| `triple_threat` | Triple Threat | 3 habits all `yes` for 7 consecutive days |
| `reflective_soul` | Reflective Soul | 5 reflections written (non-empty) |
| `conversationalist` | Conversationalist | First chatbot session (≥1 user message) |
| `early_bird` | Early Bird | Check in before 09:00 local on 5 distinct days |
| `night_owl` | Night Owl | Check in after 21:00 local on 5 distinct days |
| `mood_rainbow` | Mood Rainbow | Log all 5 mood levels within any single calendar month |
| `deep_diver` | Deep Diver | One reflection with 500+ characters |
| `fortnight_force` | Fortnight Force | 14 check-ins within any rolling 14-day window |

#### Scenario: First check-in unlocks First Step
- **WHEN** a user completes their very first check-in
- **THEN** the system inserts a `user_badges` row with `badge_code = 'first_step'`
- **AND** the AI message screen displays "First Step" as newly earned

### Requirement: Badge evaluation on check-in

The system SHALL evaluate every badge rule after each `check_ins` insert and SHALL insert any newly-satisfied `user_badges` rows. Badges already earned SHALL NOT be re-inserted. The `Conversationalist` badge SHALL be evaluated after each chat message instead.

#### Scenario: User earns Week Warrior
- **WHEN** a check-in completes that brings `currentStreak` to 7
- **THEN** the system inserts `user_badges(user_id, 'week_warrior', NOW)`
- **AND** the AI message screen lists "Week Warrior" as newly unlocked

#### Scenario: Already-earned badge does not re-fire
- **WHEN** a user who already has `week_warrior` reaches another 7-day streak after a gap
- **THEN** no new `user_badges` row is inserted
- **AND** the AI message screen does not list it as new

### Requirement: Badge gallery view

The system SHALL render `/badges` showing all 15 badges, with each badge displayed as either earned (with `earned_at` timestamp) or locked (grayscale with description visible).

#### Scenario: User views badges
- **WHEN** a user with 3 earned badges visits `/badges`
- **THEN** the system shows all 15 badges in a grid
- **AND** the 3 earned badges are full-color with the earn date
- **AND** the 12 locked badges are grayscale with their descriptions visible
