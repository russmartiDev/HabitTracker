## 1. Implementation

- [x] 1.1 Add `inputRef = useRef<HTMLInputElement>(null)` to `ChatInterface`
- [x] 1.2 Attach `ref={inputRef}` to the textarea element
- [x] 1.3 Add `useEffect(() => { if (!sending) inputRef.current?.focus(); }, [sending])`

## 2. Verification

- [x] 2.1 Send a message — textarea is focused and ready without a click after response streams in
- [x] 2.2 Trigger a send error — textarea is focused after the error message appears
