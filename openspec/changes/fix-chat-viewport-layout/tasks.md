## 1. Global shell

- [x] 1.1 Change `.app-shell` from `min-height: 100vh` to `height: 100vh` in `app/globals.css`
- [x] 1.2 Add `height: 100%; overflow-y: auto;` to `.main` in `app/globals.css`

## 2. Chat page height chain

- [x] 2.1 Add `height: 100%; overflow: hidden` to chat page root div in `app/(app)/chat/page.tsx`
- [x] 2.2 Add `flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column` to `.page-body`
- [x] 2.3 Add `flex: 1; min-height: 0; display: flex; flex-direction: column` to `.page-body-inner`

## 3. Verification

- [x] 3.1 Long conversation — message list scrolls; sidebar and input bar stay fixed
- [x] 3.2 Other pages (dashboard, insights) — scroll normally inside `.main`
- [x] 3.3 Short viewport — chat card hits `minHeight: 480` and `.main` scrolls gracefully
