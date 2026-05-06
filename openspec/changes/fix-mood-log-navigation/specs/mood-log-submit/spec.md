## ADDED Requirements

### Requirement: Mood log navigates to dashboard after successful save
After a user successfully saves a mood log entry, the app SHALL navigate to the dashboard and the dashboard SHALL display up-to-date data.

#### Scenario: Successful mood save navigates to dashboard
- **WHEN** a user selects a mood and clicks Save mood
- **THEN** the mood entry is saved and the user is navigated to the dashboard

#### Scenario: Dashboard reflects fresh data after navigation
- **WHEN** the user arrives at the dashboard after logging a mood
- **THEN** the dashboard data is not stale from a previous render
