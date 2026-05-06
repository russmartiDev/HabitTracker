## 1. Server action

- [x] 1.1 Remove `redirect('/dashboard')` from `logMoodAction`
- [x] 1.2 Add `revalidatePath('/dashboard')` before the return
- [x] 1.3 Change return type to `Promise<{ ok: true }>` and return `{ ok: true }`

## 2. Client form

- [x] 2.1 Import `useRouter` from `next/navigation` in `MoodLogForm`
- [x] 2.2 Instantiate `const router = useRouter()` in the component
- [x] 2.3 After `await logMoodAction(...)` succeeds, call `router.push('/dashboard')`

## 3. Verification

- [x] 3.1 Select a mood and click Save mood — app navigates to dashboard
- [x] 3.2 Rate-limit error (5/day) still shows correctly on the form
- [x] 3.3 Validation errors still surface on the form
