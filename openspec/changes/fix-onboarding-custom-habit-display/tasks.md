## 1. Implementation

- [x] 1.1 After the `HABIT_TEMPLATES.map(...)` block in `OnboardingFlow.tsx`, add a second render pass filtering `habits` for names not in HABIT_TEMPLATES
- [x] 1.2 Render each custom habit as a filled chip with `<Icon name="x" size={12} />` and `onClick={() => toggleHabit(name)}`

## 2. Verification

- [x] 2.1 Type a custom habit and click Add — chip appears immediately in the selection area
- [x] 2.2 Click the × on a custom chip — it disappears and the count decrements
- [x] 2.3 Type a name matching a template — template chip becomes selected, no duplicate custom chip
- [x] 2.4 "N selected" count includes both template and custom selections correctly
