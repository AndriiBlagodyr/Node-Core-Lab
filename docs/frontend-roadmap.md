# Frontend Roadmap

## Goal

Build a complete Next.js frontend that looks and behaves like a real product while the backend is implemented separately. The frontend should use shared API contracts from `@repo/types`, typed API clients, validation, realistic mock data, and production-quality UI states.

## Status

✅ **Implemented on mocks for all five modules.** Every page runs with `NEXT_PUBLIC_API_MODE=mock`. Unchecked boxes below are real gaps, summarized in [Remaining gaps](#remaining-gaps). Stack: see [project-roadmap → Stack](./project-roadmap.md#stack). Rules the code follows: CSS Modules only (no Tailwind), local state first (add Zustand only if cross-page state appears), and in-process mock adapters (MSW optional later).

## Foundation

- [x] Create app shell with main layout, navigation, and responsive page structure.
- [x] Create reusable UI components: button, input, textarea, select, modal, card, table, badge, toast, skeleton, empty state, error state.
- [ ] Checkbox component (not built yet).
- [x] Add form field components integrated with validation errors.
- [x] Add API client with base URL configuration.
- [x] Add TanStack Query provider.
- [x] Typed data access per module (inline TanStack Query calls in pages; there's no shared `hooks/<module>` layer).
- [x] Add mock data for every module.
- [x] Add protected route handling.
- [x] Add consistent loading and error handling patterns.

## Module 1: Auth & Security

- Contract: [docs/contracts/auth.md](./contracts/auth.md)
- Shared types: `packages/types/src/auth.ts`

### Pages

- [x] Login page.
- [x] Register page.
- [x] Profile page.
- [ ] Session expired page or modal (today a 401 only shows as an error).

### UI Tasks

- [x] Build login form with email and password validation.
- [x] Build register form with password confirmation.
- [x] Build profile form with editable user fields.
- [x] Add auth-aware navigation.
- [x] Add protected page wrapper.
- [x] Add unauthorized state.
- [ ] Add forbidden (403) state.

### API Client Tasks

- [x] Add `login`, `register`, `logout`, `getProfile`, `updateProfile`, and `refreshSession` methods.
- [x] Handle `401` responses.
- [ ] Add refresh-token retry flow in the API client. `AuthProvider` refreshes once on mount; `http.ts` doesn't retry a request after a 401.
- [x] Keep access token out of localStorage.
- [x] Assume refresh token is stored by the backend in an HttpOnly cookie.

### Mock Tasks

- [x] Mock successful login.
- [x] Mock validation errors.
- [x] Mock expired session.
- [x] Mock profile update.

### Social Login UI

Frontend integration with Google and GitHub via the backend OAuth/OIDC endpoints. The browser only initiates the flow and handles the callback; token exchange happens on the backend.

#### Pages and Components

- [x] Add Sign in with Google and Sign in with GitHub buttons on the Login page.
- [x] Add the same buttons on the Register page (same flow, different copy).
- [x] Add `/auth/callback/[provider]` page to receive the redirect from the backend, show a loading state, and route to the next destination.
- [x] Add an account-linking section on the Profile page that lists connected providers and lets the user link or unlink them.

#### UI Tasks

- [x] Trigger the OAuth flow by navigating to the backend authorization endpoint with a `returnTo` parameter.
- [x] Show provider-specific button styling that meets brand guidelines.
- [x] Show error states for cancelled login, denied permissions, and provider downtime.
- [x] Show "email already in use" state with a clear path to log in and link from the profile.
- [x] Disable social login buttons while a flow is in progress.

#### API Client Tasks

- [x] Add `getOAuthAuthorizeUrl(provider, returnTo)` helper that builds the backend redirect URL.
- [x] Add `linkSocialAccount(provider)` and `unlinkSocialAccount(provider)` methods.
- [x] Add `getLinkedAccounts()` method for the profile page.

#### Mock Tasks

- [x] Mock the callback page success state.
- [x] Mock the callback page failure states (invalid state, denied, email collision).
- [x] Mock the linked-accounts list with both linked and unlinked providers.

## Module 2: High-Performance Search

- Contract: [docs/contracts/search.md](./contracts/search.md)
- Shared types: `packages/types/src/search.ts`

### Pages

- [x] Search dashboard page.
- [x] Data table page.
- [x] Item details page.

### UI Tasks

- [x] Build data table with sorting.
- [x] Add text search with debounce.
- [x] Add advanced filters.
- [x] Sync filters, sorting, and cursor state with URL query params.
- [x] Add infinite scroll.
- [x] Add loading skeletons.
- [x] Add empty state for no results.
- [x] Add error state with retry.
- [ ] Add column visibility controls.

### API Client Tasks

- [x] Add typed search request and response.
- [x] Support cursor pagination.
- [x] Support filter serialization.
- [x] Support query cancellation during rapid search changes.

### Mock Tasks

- [x] Add large mock dataset.
- [x] Simulate slow network.
- [x] Simulate empty results.
- [x] Simulate next-page loading.

## Module 3: File Streaming & Processing

- Contract: [docs/contracts/files.md](./contracts/files.md)
- Shared types: `packages/types/src/files.ts`

### Pages

- [x] File upload page.
- [x] File library page.
- [x] File details page.
- [x] Video player page.

### UI Tasks

- [x] Build drag-and-drop uploader.
- [x] Show upload progress.
- [x] Support pause, resume, and cancel controls in the UI.
- [x] Show file validation errors.
- [x] Show processing status after upload.
- [x] Build video player with loading and error states.
- [x] Build private file access UI.

### API Client Tasks

- [x] Add multipart upload initiation.
- [x] Add chunk upload method.
- [x] Add upload completion method.
- [x] Add processing status polling.
- [x] Add file download and stream URL methods.

### Mock Tasks

- [x] Simulate chunk upload progress.
- [x] Simulate processing states.
- [x] Simulate failed upload.
- [x] Simulate video file playback metadata.

## Module 4: Task Queue & Background Processing

- Contract: [docs/contracts/jobs.md](./contracts/jobs.md)
- Shared types: `packages/types/src/jobs.ts`

### Pages

- [x] Jobs dashboard.
- [x] Job details page.
- [x] Report generation page.

### UI Tasks

- [x] Display job list with statuses.
- [x] Display progress bars.
- [x] Add status badges: queued, running, completed, failed, cancelled.
- [x] Add retry action.
- [x] Add cancel action.
- [x] Add job logs preview.
- [x] Add polling or SSE-based live updates.

### API Client Tasks

- [x] Add create job method.
- [x] Add get jobs method.
- [x] Add get job details method.
- [x] Add retry job method.
- [x] Add cancel job method.
- [x] Add SSE or polling update handler.

### Mock Tasks

- [x] Simulate full job lifecycle.
- [x] Simulate failed job.
- [x] Simulate retry success.
- [x] Simulate long-running report generation.

## Module 5: Real-time Chat & WebSockets

- Contract: [docs/contracts/chat.md](./contracts/chat.md)
- Shared types: `packages/types/src/chat.ts`

### Pages

- [x] Chat page.
- [x] Contact list.
- [x] Conversation view.

### UI Tasks

- [x] Build chat layout with sidebar and message window.
- [x] Show online and offline presence.
- [x] Show typing indicator.
- [x] Add optimistic message sending.
- [x] Add unread message badges.
- [x] Add message delivery states.
- [x] Add reconnecting state.
- [x] Add paginated chat history loading.

### API Client Tasks

- [x] Add WebSocket connection layer.
- [x] Add authenticated socket connection handling.
- [x] Add event handlers for messages, typing, presence, and reconnect.
- [x] Add REST fallback methods for chat history.

### Mock Tasks

- [x] Mock incoming messages.
- [x] Mock typing indicator.
- [x] Mock online status changes.
- [x] Mock reconnect behavior.

## Quality

No frontend tests exist yet. Do these alongside [Backend M11](./backend-roadmap.md#module-11-testing-strategy).

- [ ] Add component tests for reusable components.
- [ ] Add tests for forms and validation.
- [ ] Add API client tests with mocked responses.
- [ ] Add Playwright smoke tests for critical flows. These double as the Phase D E2E tests.
- [ ] Add accessibility checks for forms, modals, and tables.
- [ ] Add Web Vitals reporting placeholder.

## Remaining gaps

Frontend work the backend modules will need. Close each gap in the same PR as its matching backend module.

| Module | Gap |
| --- | --- |
| Foundation | Checkbox component |
| M1 Auth | Refresh-on-401 retry in `http.ts`; session-expired UI; 403 state; no pages for verify email, forgot/reset password, or TOTP 2FA even though the backend roadmap plans those endpoints |
| M2 Search | Column visibility controls |
| M5 Chat | No REST send or mark-read calls in the `real*` adapter; the WebSocket is the only write path |
| All | Tests (see [Quality](#quality)) |
