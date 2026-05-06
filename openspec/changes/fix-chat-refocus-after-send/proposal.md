# Fix — Chat refocus after send

## Why

After sending a message in the chat companion, the textarea lost focus because `disabled={sending}` released it during the streaming response. Users had to click the input again before typing their next message — interrupting the conversational flow.

## What Changes

- **`components/ChatInterface.tsx`**: Added `inputRef` (useRef) attached to the textarea, and a `useEffect` that calls `inputRef.current?.focus()` whenever `sending` transitions to `false`.

## Capabilities

### New Capabilities

*(none — this is a bug fix with no new spec-level behavior)*

### Modified Capabilities

*(none)*

## Impact

- **Modified files**: `components/ChatInterface.tsx`
- No new dependencies. No API or DB changes. No breaking changes.
