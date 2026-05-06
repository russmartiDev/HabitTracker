## ADDED Requirements

### Requirement: Custom habits visible as chips in onboarding
Custom habits added during onboarding SHALL appear as selected chips in the habit list immediately after being added, with a control to remove them.

#### Scenario: Custom habit appears after Add
- **WHEN** a user types a custom habit name and clicks Add (or presses Enter)
- **THEN** a filled chip for that habit appears in the selection area

#### Scenario: Custom habit can be removed
- **WHEN** a user clicks a custom habit chip
- **THEN** the chip is removed and the habit is deselected

#### Scenario: Custom habit name matching a template
- **WHEN** a user types a name that exactly matches a template habit
- **THEN** the template chip appears selected (no duplicate custom chip is shown)
