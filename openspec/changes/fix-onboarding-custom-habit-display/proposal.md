# Fix — Onboarding custom habit display

## Why

On onboarding step Q3/4 (habit selection), typing a custom habit name and clicking Add correctly added it to state — but no chip appeared for it in the UI. Only `HABIT_TEMPLATES` entries were rendered as chips. Users saw only the count tick up ("1 selected") with no visual confirmation, making the feature appear broken.

## What Changes

- **`components/OnboardingFlow.tsx`**: After the HABIT_TEMPLATES chip block, a second pass renders any habit in state that isn't in the template set as a filled chip with an × icon. Clicking the chip calls `toggleHabit(name)` to remove it, giving parity with the toggle behavior of template chips.

## Capabilities

### New Capabilities

*(none — restores intended behavior of an existing feature)*

### Modified Capabilities

*(none)*

## Impact

- **Modified files**: `components/OnboardingFlow.tsx`
- No new dependencies. No API or DB changes. No breaking changes.
