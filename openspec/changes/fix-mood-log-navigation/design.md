# Design — Mood log navigation fix

## Context

In React 19, `startTransition(async fn)` treats the async function as an "action." Server Actions that call `redirect()` rely on Next.js converting the thrown NEXT_REDIRECT into a client-side navigation instruction. This handoff is fragile in Next.js 15+: if the framework-level redirect handling doesn't fire correctly, the client sees no error and no navigation — the form appears broken.

## Goals / Non-Goals

**Goals:** Mood log always navigates to the dashboard after a successful save; dashboard shows fresh mood data.

**Non-Goals:** Showing a success toast on the mood page before navigating; changing the redirect target.

## Decisions

**Return `{ ok: true }` from action, navigate client-side**
Explicit `router.push('/dashboard')` on the client is not subject to the server→client redirect handoff. The action's responsibility ends at data mutation + cache invalidation; navigation is the client's concern. This matches the pattern used for `updateProfileAction`.

**`revalidatePath('/dashboard')` instead of `redirect()`**
`redirect()` in Next.js 15+ does NOT automatically revalidate the cache for the target path. Explicit `revalidatePath` ensures the dashboard renders fresh data after navigation.

## Risks / Trade-offs

- None significant. The change is a mechanical refactor of action → client navigation.
