## 1. Server Action

- [x] 1.1 Add `updateToneAction` to `lib/actions/settings.ts` — validates enum, updates DB, calls `revalidatePath('/', 'layout')`

## 2. TonePicker Component

- [x] 2.1 Create `components/TonePicker.tsx` — inline dropdown with `useOptimistic` + `useTransition`, closes on outside click
- [x] 2.2 Update `app/(app)/chat/page.tsx` — replace static tone label with `<TonePicker currentPref={user.communication_pref} />`

## 3. Mood Face Tooltips

- [x] 3.1 Import `MOOD_LABELS` in `components/MoodLogForm.tsx`
- [x] 3.2 Add `hoveredMood` state and wrap each mood button in a positioned container with a conditional tooltip `<div>`

## 4. Chat autoFocus

- [x] 4.1 Add `autoFocus` prop to the `<textarea>` in `components/ChatInterface.tsx`

## 5. Verification

- [x] 5.1 Chat page: tone label is clickable, dropdown shows all three options, selection persists on reload
- [x] 5.2 Mood log: hovering each face shows its label, label disappears on mouse leave
- [x] 5.3 Chat page: textarea is focused on load without a click
- [x] 5.4 Settings page: tone chip-row still works independently and reflects changes made via TonePicker
