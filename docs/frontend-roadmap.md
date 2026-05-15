# Frontend Roadmap

## Goal

Build a complete Next.js frontend that looks and behaves like a real product while the backend is implemented separately. The frontend should use shared API contracts from `@repo/types`, typed API clients, validation, realistic mock data, and production-quality UI states.

## Technology Decisions

- Framework: Next.js App Router.
- Styling: CSS Modules. Do not use Tailwind.
- Forms: React Hook Form + Zod.
- Data fetching: TanStack Query.
- API client: typed wrapper around `fetch` or axios.
- State: local React state first; add Zustand only if cross-page client state becomes necessary.
- Mocking: local mock data and mock API adapters first; MSW can be added later if needed.

## Foundation Tasks

- Create app shell with main layout, navigation, and responsive page structure.
- Create reusable UI components: button, input, textarea, select, checkbox, modal, card, table, badge, toast, skeleton, empty state, error state.
- Add form field components integrated with validation errors.
- Add API client with base URL configuration.
- Add TanStack Query provider.
- Add typed hooks for each module API.
- Add mock data for every module.
- Add protected route handling.
- Add consistent loading and error handling patterns.

## Module 1: Auth & Security

- Contract: [docs/contracts/auth.md](./contracts/auth.md)
- Shared types: `packages/types/src/auth.ts`

### Pages

- Login page.
- Register page.
- Profile page.
- Session expired page or modal.

### UI Tasks

- Build login form with email and password validation.
- Build register form with password confirmation.
- Build profile form with editable user fields.
- Add auth-aware navigation.
- Add protected page wrapper.
- Add unauthorized and forbidden states.

### API Client Tasks

- Add `login`, `register`, `logout`, `getProfile`, `updateProfile`, and `refreshSession` methods.
- Handle `401` responses.
- Add refresh-token retry flow in the API client.
- Keep access token out of localStorage.
- Assume refresh token is stored by the backend in an HttpOnly cookie.

### Mock Tasks

- Mock successful login.
- Mock validation errors.
- Mock expired session.
- Mock profile update.

### Social Login UI

Frontend integration with Google and GitHub via the backend OAuth/OIDC endpoints. The browser only initiates the flow and handles the callback; token exchange happens on the backend.

#### Pages and Components

- Add Sign in with Google and Sign in with GitHub buttons on the Login page.
- Add the same buttons on the Register page (same flow, different copy).
- Add `/auth/callback/[provider]` page to receive the redirect from the backend, show a loading state, and route to the next destination.
- Add an account-linking section on the Profile page that lists connected providers and lets the user link or unlink them.

#### UI Tasks

- Trigger the OAuth flow by navigating to the backend authorization endpoint with a `returnTo` parameter.
- Show provider-specific button styling that meets brand guidelines.
- Show error states for cancelled login, denied permissions, and provider downtime.
- Show "email already in use" state with a clear path to log in and link from the profile.
- Disable social login buttons while a flow is in progress.

#### API Client Tasks

- Add `getOAuthAuthorizeUrl(provider, returnTo)` helper that builds the backend redirect URL.
- Add `linkSocialAccount(provider)` and `unlinkSocialAccount(provider)` methods.
- Add `getLinkedAccounts()` method for the profile page.

#### Mock Tasks

- Mock the callback page success state.
- Mock the callback page failure states (invalid state, denied, email collision).
- Mock the linked-accounts list with both linked and unlinked providers.

## Module 2: High-Performance Search

- Contract: [docs/contracts/search.md](./contracts/search.md)
- Shared types: `packages/types/src/search.ts`

### Pages

- Search dashboard page.
- Data table page.
- Item details page.

### UI Tasks

- Build data table with sorting.
- Add text search with debounce.
- Add advanced filters.
- Sync filters, sorting, and cursor state with URL query params.
- Add infinite scroll.
- Add loading skeletons.
- Add empty state for no results.
- Add error state with retry.
- Add column visibility controls.

### API Client Tasks

- Add typed search request and response.
- Support cursor pagination.
- Support filter serialization.
- Support query cancellation during rapid search changes.

### Mock Tasks

- Add large mock dataset.
- Simulate slow network.
- Simulate empty results.
- Simulate next-page loading.

## Module 3: File Streaming & Processing

- Contract: [docs/contracts/files.md](./contracts/files.md)
- Shared types: `packages/types/src/files.ts`

### Pages

- File upload page.
- File library page.
- File details page.
- Video player page.

### UI Tasks

- Build drag-and-drop uploader.
- Show upload progress.
- Support pause, resume, and cancel controls in the UI.
- Show file validation errors.
- Show processing status after upload.
- Build video player with loading and error states.
- Build private file access UI.

### API Client Tasks

- Add multipart upload initiation.
- Add chunk upload method.
- Add upload completion method.
- Add processing status polling.
- Add file download and stream URL methods.

### Mock Tasks

- Simulate chunk upload progress.
- Simulate processing states.
- Simulate failed upload.
- Simulate video file playback metadata.

## Module 4: Task Queue & Background Processing

- Contract: [docs/contracts/jobs.md](./contracts/jobs.md)
- Shared types: `packages/types/src/jobs.ts`

### Pages

- Jobs dashboard.
- Job details page.
- Report generation page.

### UI Tasks

- Display job list with statuses.
- Display progress bars.
- Add status badges: queued, running, completed, failed, cancelled.
- Add retry action.
- Add cancel action.
- Add job logs preview.
- Add polling or SSE-based live updates.

### API Client Tasks

- Add create job method.
- Add get jobs method.
- Add get job details method.
- Add retry job method.
- Add cancel job method.
- Add SSE or polling update handler.

### Mock Tasks

- Simulate full job lifecycle.
- Simulate failed job.
- Simulate retry success.
- Simulate long-running report generation.

## Module 5: Real-time Chat & WebSockets

- Contract: [docs/contracts/chat.md](./contracts/chat.md)
- Shared types: `packages/types/src/chat.ts`

### Pages

- Chat page.
- Contact list.
- Conversation view.

### UI Tasks

- Build chat layout with sidebar and message window.
- Show online and offline presence.
- Show typing indicator.
- Add optimistic message sending.
- Add unread message badges.
- Add message delivery states.
- Add reconnecting state.
- Add paginated chat history loading.

### API Client Tasks

- Add WebSocket connection layer.
- Add authenticated socket connection handling.
- Add event handlers for messages, typing, presence, and reconnect.
- Add REST fallback methods for chat history.

### Mock Tasks

- Mock incoming messages.
- Mock typing indicator.
- Mock online status changes.
- Mock reconnect behavior.

## Quality Tasks

- Add component tests for reusable components.
- Add tests for forms and validation.
- Add API client tests with mocked responses.
- Add Playwright smoke tests for critical flows.
- Add accessibility checks for forms, modals, and tables.
- Add Web Vitals reporting placeholder.
