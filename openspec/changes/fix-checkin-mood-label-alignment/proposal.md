# Fix — Check-in mood label alignment

## Why

On the check-in mood step, the text labels ("Rough", "Meh", "Okay", "Good", "Great") were in a separate `row between` container below the emoji buttons. The labels used `flex: 1; text-align: center` to try to align under each button, but `space-between` distributes button centers at positions that don't match the label centers at equal-flex-fraction midpoints — so labels were visibly offset from their icons.

## What Changes

- **`components/CheckInForm.tsx`** (`MoodStep`): Replaced the two separate `row between` containers (one for buttons, one for labels) with a single `row between` container where each child is a `flex-column` wrapper holding one button + its label. The label is always exactly centered under its button regardless of container width.

## Capabilities

### New Capabilities

*(none — visual alignment fix)*

### Modified Capabilities

*(none)*

## Impact

- **Modified files**: `components/CheckInForm.tsx`
- No new dependencies. No API or DB changes. No breaking changes.
