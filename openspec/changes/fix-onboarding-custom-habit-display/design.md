# Design — Onboarding custom habit display

## Context

The habit chip list iterated `HABIT_TEMPLATES` only. `addCustomHabit()` correctly mutated `habits[]` state, but there was no render path for entries not in the template set. The counter ("N selected") updated, but no chip appeared.

## Goals / Non-Goals

**Goals:** Custom habits appear as chips immediately after being added; each has a removal affordance.

**Non-Goals:** Custom habit icon (no icon available — plain text chip only); persistence of custom habits beyond the onboarding submit.

## Decisions

**Filter + second render pass rather than merging into HABIT_TEMPLATES**
Template chips and custom chips have different shapes (templates have an icon; custom ones don't). A second `habits.filter(name => !HABIT_TEMPLATES.some(t => t.name === name))` pass keeps the two lists cleanly separated without adding a discriminator field.

**× icon on custom chips; toggle behavior matches templates**
`toggleHabit(name)` removes a habit that's already in the array — the same function used for template chip deselection. No new removal logic needed.

## Risks / Trade-offs

- A user could type a name that exactly matches a template (e.g. "Exercise"). It would not appear as a custom chip (the filter excludes template names), but the template chip would show as selected — correct behavior.
