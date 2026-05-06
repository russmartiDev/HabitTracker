# Fix — Mood log navigation after submit

## Why

`logMoodAction` called `redirect('/dashboard')` server-side inside a `startTransition`-based Server Action. In Next.js 16 + React 19, this pattern is unreliable — the client-side navigation may not trigger, leaving the form in a frozen state with no feedback and no redirect.

## What Changes

- **`lib/actions/mood.ts`**: Remove `redirect('/dashboard')`; add `revalidatePath('/dashboard')` to ensure fresh data; return `{ ok: true }` so the client knows the action succeeded.
- **`components/MoodLogForm.tsx`**: Import `useRouter`; after a successful action result, call `router.push('/dashboard')` explicitly on the client.

## Capabilities

### New Capabilities

*(none — navigation reliability fix)*

### Modified Capabilities

*(none)*

## Impact

- **Modified files**: `lib/actions/mood.ts`, `components/MoodLogForm.tsx`
- No new dependencies. No DB or API changes. No breaking changes.
