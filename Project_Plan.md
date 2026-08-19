# Zorabase Implementation Plan

Zorabase is a Developer-First Backend-as-a-Service (BaaS) providing a simplified, scalable core: PostgreSQL + REST API + JWT Auth + WebSockets + S3 Storage + SDKs.

## Proposed Phases & Steps

### Phase 1: Foundation
- **Goal:** Set up the monorepo and baseline API.
- **Steps:**
  1. Initialize a pnpm monorepo (e.g., `backend-platform/apps/api`, `packages/sdk`, etc.).
  2. Configure TypeScript, ESLint, Prettier, and Fastify (Node.js backend).
  3. Implement centralized error handling, structured logging, and health endpoints (`/health`, `/ready`).
  4. Set up PostgreSQL connection pooling and a database migration system.
  5. Add Docker configuration, `.env.example`, and Render deployment settings.
  6. Create the initial platform database schemas.

### Phase 2: Projects & Accounts
- **Goal:** Manage tenants (projects) and authentication for developers.
- **Steps:**
  1. Implement account creation and management.
  2. Implement project creation and project metadata schemas.
  3. Implement project isolation primitives (always require `project_id` context).
  4. Generate and manage Public and Server API keys.

### Phase 3: Database & CRUD
- **Goal:** Expose database operations via a safe API.
- **Steps:**
  1. Build table metadata tracking.
  2. Create a secure internal query builder and CRUD endpoints.
  3. Support filtering, pagination, and indexing via API.

### Phase 4: Authentication
- **Goal:** End-user authentication for customer applications.
- **Steps:**
  1. Set up the `auth.users` schema.
  2. Implement password hashing using Argon2id.
  3. Issue and validate JWTs and refresh tokens.
  4. Build email verification and password reset flows.

### Phase 5: Authorization (Row-Level Security)
- **Goal:** Protect data access.
- **Steps:**
  1. Implement project-level isolation middleware.
  2. Build a structured policy engine (JSON-based rules).
  3. Enforce row-level authorization on all database queries.

### Phase 6: Storage
- **Goal:** File uploads directly to AWS S3.
- **Steps:**
  1. Implement storage bucket metadata.
  2. Build APIs to generate S3 presigned URLs for direct upload/download.
  3. Enforce permissions and metadata tracking for storage objects.

### Phase 7: Realtime
- **Goal:** Live database events.
- **Steps:**
  1. Set up a WebSocket server in Fastify.
  2. Integrate PostgreSQL `LISTEN`/`NOTIFY`.
  3. Handle channel subscriptions, broadcast events (INSERT/UPDATE/DELETE), and enforce authorization.

### Phase 8: SDK
- **Goal:** Official TypeScript SDK.
- **Steps:**
  1. Create `@zorabase/sdk`.
  2. Build modules for Auth, Database (`.from`), Storage, and Realtime (`.channel`).
  3. Hide HTTP details and provide an intuitive developer experience.

### Phase 9: Dashboard
- **Goal:** Web interface for developers.
- **Steps:**
  1. Build a React/Next.js dashboard for project management.
  2. Create UIs for database management, auth, storage, API keys, logs, and usage.
  3. Automatically generate AI coding-agent prompts and SDK integration configs.

### Phase 10: Developer Experience
- **Goal:** Onboarding and tooling.
- **Steps:**
  1. Write comprehensive documentation (`/getting-started`, `/auth`, etc.).
  2. Develop a CLI tool (`zorabase login`, `zorabase projects create`).
  3. Finalize templates and quickstart examples.
