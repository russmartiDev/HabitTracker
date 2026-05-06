# Design — Check-in mood label alignment

## Context

Two sibling `row between` containers tried to align buttons and labels by column position. `space-between` places button centers at non-uniform fractional positions relative to container width; `flex: 1; text-align: center` places label centers at uniform fractional positions. These only match when container width equals exactly `5 × button-width + 4 × gap`, which is not guaranteed.

## Goals / Non-Goals

**Goals:** Each label is always centered directly under its emoji button regardless of container width.

**Non-Goals:** Animated label transitions; label on hover only (labels are always visible in the check-in context, unlike the mood log where they are tooltip-only).

## Decisions

**Wrap each button+label in a `flex-column` container**
Putting the label inside the same flex column as its button guarantees alignment by construction — `align-items: center` on the column centers both. The outer `row between` still distributes the pairs evenly. No measurement or JS required.

**Removed the separate label `<div>` entirely**
The old `row between t-eyebrow` label row is replaced by inline `<span>` elements inside each column. Fewer DOM nodes, one less layout row to coordinate.

## Risks / Trade-offs

- None. Pure DOM restructuring with no behavior change.
