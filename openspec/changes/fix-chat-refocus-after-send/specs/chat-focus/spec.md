## ADDED Requirements

### Requirement: Chat input refocused after message send
The chat textarea SHALL receive keyboard focus automatically after each message send cycle completes, so the user can type their next message without a manual click.

#### Scenario: Focus restored after send completes
- **WHEN** a user sends a message and the AI response finishes streaming
- **THEN** the message textarea is focused and ready for keyboard input

#### Scenario: Focus restored after send error
- **WHEN** a send attempt fails (network error or server error)
- **THEN** the message textarea is focused so the user can retry
