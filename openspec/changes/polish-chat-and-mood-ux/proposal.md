# Polish — Chat and Mood UX

## Why

Two of the app's highest-engagement surfaces — the chat companion and the mood log — had small but persistent friction points: the AI tone was a static label with no inline control, mood face buttons had no labels so their meaning was ambiguous, and the chat input required a manual click to start typing. These are already implemented and this change documents them.

## What Changes

- **TonePicker component** (`components/TonePicker.tsx`, new): Inline dropdown in the chat page header that lets users switch communication tone (encouraging / direct / playful) without navigating to Settings. Uses `useOptimistic` for instant UI feedback.
- **`updateToneAction` server action** (`lib/actions/settings.ts`): New action that validates and persists tone preference, revalidates the layout so the change propagates immediately.
- **Chat page header** (`app/(app)/chat/page.tsx`): Replaces the static bold tone label with the live `<TonePicker>` control.
- **Mood face tooltips** (`components/MoodLogForm.tsx`): Hover state on each mood face button shows the label ("Rough", "Meh", "Okay", "Good", "Great") as a small tooltip above the button.
- **Chat autoFocus** (`components/ChatInterface.tsx`): The message textarea receives focus automatically on page load.

## Capabilities

### New Capabilities

- `inline-tone-picker`: Inline tone control on the chat page — component, server action, and optimistic UI.

### Modified Capabilities

*(none — no existing spec-level requirements change)*

## Impact

- **Modified files**: `app/(app)/chat/page.tsx`, `components/ChatInterface.tsx`, `components/MoodLogForm.tsx`, `lib/actions/settings.ts`
- **New files**: `components/TonePicker.tsx`
- No new dependencies. No DB schema changes. No API changes. No breaking changes.
