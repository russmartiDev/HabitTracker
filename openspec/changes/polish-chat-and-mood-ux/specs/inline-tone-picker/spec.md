## ADDED Requirements

### Requirement: Inline tone picker on chat page
The chat page header SHALL display the user's current communication preference as an interactive control. Selecting a new tone SHALL persist the change to the database and update the UI immediately without a full page navigation.

#### Scenario: Picker shows current tone
- **WHEN** user opens the chat page
- **THEN** the header shows a clickable label matching their stored `communication_pref`

#### Scenario: User changes tone
- **WHEN** user clicks the tone label and selects a different option
- **THEN** the label updates immediately (optimistic) and the preference is persisted to the database

#### Scenario: Tone change affects AI responses
- **WHEN** user sends a message after changing tone
- **THEN** the AI companion uses the newly selected tone for its reply

#### Scenario: Invalid tone value rejected
- **WHEN** a tone value outside the allowed enum (encouraging, direct, playful) is submitted
- **THEN** the server action returns without updating the database

### Requirement: Mood face hover labels
The mood log form SHALL display a text label above each mood face button when the user hovers over it, using the values: Rough, Meh, Okay, Good, Great.

#### Scenario: Label appears on hover
- **WHEN** user hovers over a mood face button
- **THEN** a tooltip label appears above that button

#### Scenario: Label disappears on mouse leave
- **WHEN** user moves the cursor away from a mood face button
- **THEN** the tooltip label is no longer visible

### Requirement: Chat textarea auto-focus
The chat page message input SHALL receive keyboard focus automatically when the page loads.

#### Scenario: Focus on page load
- **WHEN** user navigates to the chat page
- **THEN** the message textarea is focused and ready for keyboard input without a manual click
