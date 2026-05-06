# Design — Chat refocus after send

## Context

`ChatInterface` uses `disabled={sending}` on the textarea while streaming. Disabling a focused element causes the browser to move focus away. When `sending` returns to `false`, React re-renders the textarea as enabled but doesn't restore focus.

## Goals / Non-Goals

**Goals:** Textarea is focused and ready for input immediately after every send cycle.

**Non-Goals:** Handling focus on mobile virtual-keyboard dismiss; keyboard trap management.

## Decisions

**`useEffect` watching `sending`, not `.focus()` in `finally`**
Calling `.focus()` directly after `setSending(false)` in the `finally` block races the React re-render that removes `disabled`. A `useEffect` fires after the DOM is flushed, so `disabled` is already gone when `.focus()` runs.

## Risks / Trade-offs

- On mobile, refocusing after send reopens the soft keyboard immediately. Acceptable — chat is intent-first and users expect to keep typing.
