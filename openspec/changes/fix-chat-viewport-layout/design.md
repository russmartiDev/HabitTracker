# Design — Chat viewport layout

## Context

The app shell used `min-height: 100vh` (grows with content). The chat card's `flex: 1` had no bounded ancestor, so the card expanded to fit all messages and the browser document scrolled. The message list's `overflow: auto` was correct but never triggered.

## Goals / Non-Goals

**Goals:** Message list scrolls internally; input bar stays pinned to the bottom; page/panel does not scroll on the chat route.

**Non-Goals:** Per-route overflow toggling; mobile virtual-keyboard accommodation (handled separately by the browser).

## Decisions

**Global shell change (`height: 100vh`) rather than chat-page-only hack**
A chat-page-only fix (e.g. `height: calc(100vh - <header>)`) would require knowing the page-wash height statically or via JS measurement. Switching the shell to `height: 100vh` with `overflow-y: auto` on `.main` is the correct app-shell pattern: sidebar locked, content scrolls inside the column. All other pages are unaffected in perceived behavior.

**`min-height: 0` on flex children in the chat height chain**
Flex children default to `min-height: auto`, which prevents shrinking. Every intermediate container (`page-body`, `page-body-inner`) needs `min-height: 0` so the constraint propagates correctly to the chat card.

**`minHeight: 480` preserved on the chat card**
On very short viewports the chat card would be unusably small if fully constrained. The existing `minHeight: 480` causes `.main` to scroll in that edge case — a graceful fallback.

## Risks / Trade-offs

- `.main { padding: 0 0 48px }` — reduced from 64px. The bottom padding is still present for breathing room on other pages; the chat page overflows it cleanly because its root is `overflow: hidden`.
