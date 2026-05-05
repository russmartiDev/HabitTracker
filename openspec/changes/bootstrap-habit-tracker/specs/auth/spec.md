## ADDED Requirements

### Requirement: Email and password signup

The system SHALL allow any visitor to create an account with an email address, a password, and a display name. Email addresses MUST be unique. Passwords MUST be hashed with argon2id before storage; plaintext passwords MUST NEVER be persisted.

#### Scenario: Successful signup creates an account
- **WHEN** a visitor submits the signup form with a unique email, a password of 8+ characters, and a name
- **THEN** the system creates a `users` row with the argon2id-hashed password
- **AND** establishes an authenticated session
- **AND** redirects to `/onboarding`

#### Scenario: Duplicate email is rejected
- **WHEN** a visitor submits the signup form with an email that already exists
- **THEN** the system returns a validation error "An account with that email already exists"
- **AND** does not create a new user

#### Scenario: Weak password is rejected
- **WHEN** a visitor submits the signup form with a password shorter than 8 characters
- **THEN** the system returns a validation error
- **AND** does not create a new user

#### Scenario: Reserved demo domain is rejected
- **WHEN** a visitor submits a signup with an email ending in `@lichen.local`
- **THEN** the system returns a validation error
- **AND** does not create a new user

### Requirement: Email and password login

The system SHALL allow registered users to log in with email and password and SHALL establish a JWT session valid for 7 days on success.

#### Scenario: Successful login
- **WHEN** a registered user submits correct credentials
- **THEN** the system establishes a JWT session
- **AND** redirects to `/dashboard` (or `/onboarding` if `onboarding_completed = 0`)

#### Scenario: Wrong password
- **WHEN** a user submits a known email with an incorrect password
- **THEN** the system returns a generic error "Invalid email or password"
- **AND** does not establish a session

#### Scenario: Unknown email
- **WHEN** a user submits an email that does not exist
- **THEN** the system returns the same generic error "Invalid email or password"
- **AND** does not establish a session

### Requirement: Route protection

The system SHALL block unauthenticated access to all routes under `(app)/*` and SHALL allow unauthenticated access only to `/login`, `/signup`, and `/api/auth/*`.

#### Scenario: Unauthenticated user hits protected route
- **WHEN** an unauthenticated request reaches any `(app)/*` route
- **THEN** the system redirects to `/login` with a `?next=` parameter preserving the original path

#### Scenario: Authenticated user hits auth route
- **WHEN** an authenticated request reaches `/login` or `/signup`
- **THEN** the system redirects to `/dashboard`

### Requirement: Logout

The system SHALL provide a logout action that clears the session.

#### Scenario: User logs out
- **WHEN** an authenticated user invokes the logout action
- **THEN** the system clears the JWT session cookie
- **AND** redirects to `/login`

### Requirement: No password reset in v1

The system SHALL NOT provide a password reset flow in v1. The login page SHALL display a note explaining password reset is not available.

#### Scenario: User requests password reset
- **WHEN** a user looks for "Forgot password" on the login page
- **THEN** the page displays the text "Password reset is coming soon. Contact the administrator if you're locked out."
- **AND** no reset endpoint exists
