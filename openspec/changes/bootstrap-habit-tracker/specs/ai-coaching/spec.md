## ADDED Requirements

### Requirement: Server-only Anthropic client

The system SHALL instantiate the Anthropic client only in server code and SHALL NEVER expose the API key to the browser. All Claude calls SHALL flow through Server Actions or Route Handlers.

#### Scenario: Client bundle audit
- **WHEN** the production client bundle is inspected
- **THEN** no occurrence of `ANTHROPIC_API_KEY` appears
- **AND** no `import` of `@anthropic-ai/sdk` appears in any client component

### Requirement: Check-in analysis (Claude-powered)

When `ai_path = 'ai'` is selected for a check-in, the system SHALL call Claude with:
- The current check-in (mood, habit answers, reflection)
- The user's last 7 days of check-ins (mood, completion summary)
- The user's `communication_pref` ("encouraging" | "direct" | "playful")
- The user's `name` and primary `goal`

The model SHALL be `claude-haiku-4-5-20251001`. The system prompt SHALL instruct the model to return ONE short message (1–3 sentences) of one of these types: praise, insight, gentle nudge, or suggestion. The response SHALL be stored in `check_ins.ai_message`.

#### Scenario: Successful AI analysis
- **WHEN** a check-in with `ai_path = 'ai'` submits and Claude responds
- **THEN** the system stores the message text in `check_ins.ai_message`
- **AND** displays it on the AI message screen

#### Scenario: Claude API errors
- **WHEN** the Claude call returns an error or times out (>15s)
- **THEN** the system falls back to an algorithmic message
- **AND** persists `ai_path = 'algorithmic'` for that check-in
- **AND** the user sees the fallback message without an error indicator

### Requirement: Algorithmic check-in messages

When `ai_path = 'algorithmic'`, the system SHALL produce a deterministic message from a template library, choosing based on:
- Habit completion ratio
- Mood (1–5)
- Streak length

The template library SHALL include at least 4 templates per (mood × completion) combination to avoid repetition. Templates SHALL respect the user's `communication_pref`.

#### Scenario: High completion, high mood
- **WHEN** a user completes all habits with mood 5
- **THEN** the message is selected from the praise template pool matching the user's communication_pref

#### Scenario: Low mood, low completion
- **WHEN** a user with mood 1 completes 0 habits
- **THEN** the message is selected from the gentle-nudge template pool
- **AND** does not contain any of the words: "lazy", "failed", "should"

### Requirement: AI rate cap

The system SHALL refuse any AI-path check-in that would be the user's 11th AI-path check-in within the trailing 7 calendar days. In that case the system SHALL fall back to algorithmic.

#### Scenario: User exceeds AI cap
- **WHEN** a user already has 10 AI-path check-ins in the last 7 days and a new check-in selects `ai_path = 'ai'`
- **THEN** the system reroutes to algorithmic
- **AND** logs the event for observability

### Requirement: Chatbot at /chat

The system SHALL provide a chat interface at `/chat` that streams Claude responses via `app/api/ai/chat/route.ts`. The endpoint SHALL prepend a system prompt containing:
- The user's `name`, `goal`, `communication_pref`
- A summary of the last 7 days of check-ins (mood trend, top habits, streak)
- A safety preamble forbidding diagnostic, prescriptive, or therapeutic content

Chat messages SHALL be persisted to `chat_messages` (both user and assistant).

#### Scenario: User sends a chat message
- **WHEN** an authenticated user sends a message via `/chat`
- **THEN** the system inserts a `chat_messages` row with `role='user'`
- **AND** streams Claude's response back to the client
- **AND** inserts a `chat_messages` row with `role='assistant'` and the full response when streaming completes

#### Scenario: API key missing
- **WHEN** the user sends a chat message and `ANTHROPIC_API_KEY` is unset
- **THEN** the system returns a stubbed response: "Chat is unavailable — no API key configured."
- **AND** does not insert an assistant `chat_messages` row

### Requirement: Crisis keyword safety

The system SHALL scan every user chat message and every reflection text against a fixed list of crisis keywords (e.g., "suicide", "kill myself", "end it", "hurt myself"). On match, the system SHALL:

1. Display a banner with hotline information (US: 988; international fallback text)
2. Skip the Claude call for chat (return a hard-coded supportive reply instead)
3. Persist the user message normally

#### Scenario: User mentions self-harm in chat
- **WHEN** a user sends a chat message matching a crisis keyword
- **THEN** the system shows the hotline banner above the chat
- **AND** the assistant response is the hard-coded supportive reply
- **AND** no Claude call is made for that message

#### Scenario: Reflection contains crisis keyword
- **WHEN** a check-in reflection matches a crisis keyword
- **THEN** the AI message screen prepends the hotline banner
- **AND** the check-in is otherwise persisted normally

### Requirement: AI disclaimer

Every chatbot view SHALL display the disclaimer "I'm an AI companion, not a therapist." in a stable location on the page.

#### Scenario: User opens chat
- **WHEN** the user lands on `/chat`
- **THEN** the disclaimer is visible above the message list
