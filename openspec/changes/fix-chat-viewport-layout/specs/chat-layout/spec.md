## ADDED Requirements

### Requirement: Chat message list scrolls internally
On the chat companion page, the message list SHALL scroll within the chat card. The page panel, sidebar, and input bar SHALL remain stationary regardless of conversation length.

#### Scenario: Long conversation does not scroll the page
- **WHEN** a conversation grows beyond the visible viewport height
- **THEN** the message list scrolls internally within the chat card, not the browser document

#### Scenario: Input bar stays pinned to bottom
- **WHEN** the message list is scrolled to any position
- **THEN** the message input and send button remain visible at the bottom of the chat card
