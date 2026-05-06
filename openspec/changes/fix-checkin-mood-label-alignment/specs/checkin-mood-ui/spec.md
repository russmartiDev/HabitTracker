## ADDED Requirements

### Requirement: Mood labels aligned under their emoji buttons
On the check-in mood step, each text label (Rough, Meh, Okay, Good, Great) SHALL be horizontally centered directly under its corresponding emoji button at all container widths.

#### Scenario: Label centered under button
- **WHEN** a user views the mood step of the check-in flow
- **THEN** each mood label is visually centered under its emoji button

#### Scenario: Alignment holds at different screen widths
- **WHEN** the check-in card is rendered at any viewport width
- **THEN** all five labels remain centered under their respective buttons
