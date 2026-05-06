# Fix — Chat viewport layout (internal scroll)

## Why

When a chat conversation grew long, the browser's document scrollbar appeared on the right panel rather than the message list scrolling internally. The chat card already had `overflow: hidden` and the messages div had `overflow: auto`, but they had no bounded ancestor height to flex against — so the card grew unbounded and the page scrolled.

## What Changes

- **`app/globals.css`**: `.app-shell` changed from `min-height: 100vh` to `height: 100vh`; `.main` gains `height: 100%; overflow-y: auto;`. Other pages continue to scroll, but inside `.main` rather than at the document level — imperceptible to users.
- **`app/(app)/chat/page.tsx`**: Root div gets `height: 100%; overflow: hidden`; `.page-body` and `.page-body-inner` get `flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column` to form a complete height-constraint chain so the chat card's `flex: 1` has something to fill against.

## Capabilities

### New Capabilities

*(none — layout correctness fix)*

### Modified Capabilities

*(none)*

## Impact

- **Modified files**: `app/globals.css`, `app/(app)/chat/page.tsx`
- No new dependencies. No API or DB changes. No breaking changes.
- Side effect: all pages now scroll inside `.main` rather than the document — sidebar stays locked while content scrolls, which is the correct app-shell pattern.
