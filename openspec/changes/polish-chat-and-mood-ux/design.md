# Design — Polish Chat and Mood UX

## Context

The chat companion page previously displayed the user's tone preference as a static `<strong>` label in the subtitle. Changing it required navigating to `/settings`. Mood face buttons (1–5 scale) had no text labels, relying entirely on emoji semantics. The chat textarea required a manual click before the user could type.

All three changes are contained entirely within the client/server component layer — no schema changes, no new routes, no new dependencies.

## Goals / Non-Goals

**Goals:**
- Inline tone switching on the chat page with optimistic UI and DB persistence
- Hover tooltips on mood face buttons that reveal their text labels
- Chat textarea auto-focuses on page load

**Non-Goals:**
- Exposing TonePicker anywhere other than the chat page (settings remains the canonical home)
- Animated tooltip transitions
- Keyboard-accessible tooltip (hover-only is acceptable for this label density)

## Decisions

**TonePicker uses `useOptimistic` + a Server Action**
The picker wraps `updateToneAction` in `startTransition` with `useOptimistic` so the label flips instantly in the UI while the DB write happens in the background. Alternative considered: a route handler + `fetch`. Rejected — Server Actions with `useOptimistic` is the established pattern in this codebase (matches how other settings mutations work), and avoids an extra API endpoint.

**Tooltip is pure CSS-in-JS, no library**
The mood hover tooltip is a conditionally-rendered `<div>` with `position: absolute` driven by `onMouseEnter`/`onMouseLeave`. Alternative: a third-party tooltip library. Rejected — the design system already does all styling inline; adding a dep for five simple labels is not justified.

**TonePicker closes on outside click via `useEffect` + `mousedown` listener**
Standard pattern for lightweight dropdowns in this codebase. No portal needed — the chat header has sufficient z-space.

## Risks / Trade-offs

- **Two tone entry points** (chat page + settings) could diverge if one is updated without the other. Mitigation: both call the same `updateToneAction`, DB is the source of truth, both read from `user.communication_pref` on the server render.
- **autoFocus on mobile** may invoke the soft keyboard immediately. Acceptable trade-off — chat is intent-first on all screen sizes.
