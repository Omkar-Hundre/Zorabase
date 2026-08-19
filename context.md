Yes. The right way to approach this is **not to build a Firebase/Supabase clone feature-for-feature**. That would become a huge infrastructure project.

Instead, we should build a **developer-first Backend-as-a-Service platform** with a small, clean core:

**PostgreSQL + REST API + JWT Auth + WebSockets + S3 Storage + project-level security + SDK/config generation**

Then design the architecture so individual components can be scaled out later.

One important architectural decision: **Render should run the API/control plane, while AWS handles the durable infrastructure.** Don't store user data or uploaded files on Render's filesystem. Render's filesystem is ephemeral unless you use a persistent disk, and persistent disks are tied to a single service instance, which conflicts with horizontal scaling. ([Render][1])

For the database, PostgreSQL is the best foundation because it gives us relational queries, transactions, JSONB, LISTEN/NOTIFY, indexes, RLS-style authorization patterns, and a clear scaling path. This is also broadly the architecture Supabase itself uses. ([Supabase][2])

For storage, use S3 with **presigned URLs** so files don't have to pass through your API server. AWS explicitly supports time-limited upload/download URLs for this purpose. ([AWS Documentation][3])

Here is the `context.md` I would use as the **master context for the coding agent**.

# Project Context: Developer-First Backend as a Service

## 1. Project Overview

We are building a lightweight, scalable Backend-as-a-Service platform inspired by Firebase and Supabase.

The goal is to provide developers with an extremely simple backend that they can connect to their applications with a project URL, API key, SDK, and a small amount of configuration.

The platform should provide:

* PostgreSQL database
* REST API
* Authentication
* JWT-based authorization
* Row/project-level security
* Realtime database events
* WebSocket subscriptions
* S3 file storage
* Presigned upload/download URLs
* Project management
* API keys
* Database/table management
* Storage buckets
* Realtime subscriptions
* Usage tracking
* Rate limiting
* Logs
* Developer dashboard
* Generated integration configuration
* Generated AI coding-agent setup instructions
* JavaScript/TypeScript SDK initially
* Clean API documentation

The product should feel significantly simpler than managing a raw PostgreSQL database.

The developer should be able to:

1. Create a project.
2. Receive a project URL.
3. Create tables.
4. Create authentication rules.
5. Create storage buckets.
6. Copy an API key.
7. Install an SDK.
8. Connect their application.
9. Start using the backend immediately.

---

# 2. Core Product Philosophy

The product is NOT intended to initially reproduce every feature of Firebase or Supabase.

We should focus on the 80/20 functionality that developers actually need.

The first version should prioritize:

1. Database
2. Authentication
3. Authorization
4. Realtime
5. Storage
6. API
7. SDK
8. Developer dashboard
9. Documentation
10. AI-agent integration

Everything else should be designed as an extension point.

Do not prematurely implement:

* Edge Functions
* GraphQL
* Multi-region databases
* Kubernetes
* Complex serverless functions
* Full SQL editor
* Advanced analytics
* Multi-region realtime
* Database branching
* Complex billing
* Enterprise SSO

These can be added later.

---

# 3. High-Level Architecture

The initial architecture should be:

```text
                        ┌─────────────────────┐
                        │   Developer App     │
                        │ React / Next.js     │
                        │ Mobile / Backend    │
                        └──────────┬──────────┘
                                   │
                                   │ HTTPS
                                   ▼
                     ┌──────────────────────────┐
                     │       API Gateway        │
                     │       / REST API         │
                     │       Auth + Rate Limit  │
                     └────────────┬─────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
                ▼                 ▼                 ▼
        ┌──────────────┐  ┌───────────────┐  ┌──────────────┐
        │ Auth Service │  │ Database API  │  │ Storage API  │
        │ JWT / Users  │  │ REST / Query  │  │ S3 Adapter   │
        └──────┬───────┘  └───────┬───────┘  └──────┬───────┘
               │                  │                 │
               │                  ▼                 ▼
               │          ┌───────────────┐   ┌────────────┐
               │          │ PostgreSQL    │   │ AWS S3     │
               │          │               │   │            │
               │          └───────────────┘   └────────────┘
               │
               ▼
        ┌────────────────┐
        │ JWT / Sessions │
        └────────────────┘

                       Realtime
                          │
                          ▼
                 ┌─────────────────┐
                 │ WebSocket Layer │
                 │ PostgreSQL      │
                 │ LISTEN/NOTIFY   │
                 └─────────────────┘
```

The application backend will initially be deployed on Render.

Durable data should live outside the Render filesystem.

AWS should be used for infrastructure components where appropriate, especially:

* S3
* PostgreSQL/RDS
* Future Redis/ElastiCache
* Future CloudFront
* Future queues/workers
* Future observability infrastructure

---

# 4. Hosting Strategy

## Application Layer

Deploy the API service on Render.

The API should:

* listen on `process.env.PORT`
* expose HTTPS through Render
* have a health endpoint
* use environment variables for secrets
* support Docker deployment
* be stateless
* avoid writing persistent application data to local disk

Example:

```text
https://api.example.com
```

or initially:

```text
https://your-service.onrender.com
```

The API must be designed so multiple instances can eventually run simultaneously.

---

# 5. Database Architecture

Use PostgreSQL as the primary database.

The platform should NOT expose the raw database directly to normal frontend clients.

Instead:

```text
Client
  ↓
API
  ↓
Authorization
  ↓
Database Query Layer
  ↓
PostgreSQL
```

The database layer should support:

* tables
* columns
* data types
* primary keys
* foreign keys
* indexes
* unique constraints
* default values
* timestamps
* JSONB
* transactions
* migrations

Recommended database:

```text
PostgreSQL 16+
```

The application must use a connection pool.

Never create a new database connection for every request.

---

# 6. Multi-Tenant Architecture

Every user-created backend is represented as a Project.

Core hierarchy:

```text
Account
   │
   ├── Projects
   │      │
   │      ├── Tables
   │      ├── Auth Users
   │      ├── Storage Buckets
   │      ├── API Keys
   │      └── Realtime Channels
   │
   └── Memberships
```

Every project must have a unique:

```text
project_id
```

Example:

```text
proj_01JXYZ...
```

Never use predictable numeric project IDs.

Use UUID/ULID-style identifiers.

---

# 7. Internal Platform Database

The platform itself needs a metadata database.

Do NOT mix platform metadata blindly with customer tables.

Recommended schemas:

```text
platform
auth
storage
realtime
public
```

Example:

```text
platform.projects
platform.project_members
platform.api_keys
platform.audit_logs
platform.usage
platform.rate_limits

auth.users
auth.sessions
auth.identities
auth.refresh_tokens

storage.buckets
storage.objects

realtime.channels
```

Customer application tables can live inside a project-specific schema or controlled namespace.

Preferred initial strategy:

```text
project_<project_id>
```

or another isolated schema namespace.

The database abstraction must make this implementation replaceable later.

---

# 8. REST API

The API should be predictable.

Base URL:

```text
https://api.example.com
```

Project URL:

```text
https://api.example.com/project/<PROJECT_ID>
```

API version:

```text
/api/v1
```

Example:

```text
https://api.example.com/api/v1/projects/<PROJECT_ID>
```

Database endpoints should support:

```text
GET
POST
PATCH
PUT
DELETE
```

Example:

```text
GET /api/v1/data/users
POST /api/v1/data/users
PATCH /api/v1/data/users/:id
DELETE /api/v1/data/users/:id
```

Filtering:

```text
?select=id,name,email
?status=eq.active
?age=gt.18
?order=created_at.desc
?limit=20
?offset=0
```

Do not allow arbitrary SQL from public API keys.

Public clients must use a controlled query builder.

---

# 9. Database Query Engine

Create an internal query abstraction.

Example:

```ts
db
  .from("users")
  .select("*")
  .eq("status", "active")
  .limit(20)
```

The SDK should convert this into safe API requests.

Never concatenate raw user input into SQL.

Use:

* parameterized queries
* schema validation
* allowlisted operators
* query limits
* pagination limits
* timeout limits

---

# 10. Authentication

Authentication is a first-class service.

Initial authentication methods:

* email/password
* email verification
* password reset
* refresh tokens
* logout
* session management

Future:

* Google
* GitHub
* Apple
* Microsoft
* magic links
* OTP
* phone authentication

JWT access tokens should be short-lived.

Recommended model:

```text
Access Token
Short lifetime

Refresh Token
Longer lifetime
Stored securely
Rotatable
Revocable
```

Never put sensitive information into JWT payloads.

JWT should contain only the minimum required claims.

Example:

```json
{
  "sub": "user_id",
  "project_id": "project_id",
  "role": "authenticated",
  "iat": 123456789,
  "exp": 123456789
}
```

---

# 11. Password Security

Passwords must NEVER be stored directly.

Use a modern password hashing algorithm such as:

```text
Argon2id
```

Requirements:

* password hashing
* password verification
* password reset tokens
* email verification tokens
* brute-force protection
* login rate limiting

Never log:

* passwords
* refresh tokens
* raw authorization headers
* private API keys

---

# 12. API Keys

Every project should have API credentials.

There should be two conceptual types.

## Public Key

Used by frontend applications.

Example:

```text
public_xxxxxxxxx
```

The public key is not itself authorization to bypass database policies.

It identifies the project and represents an untrusted client.

## Server Key

Used only by trusted backend environments.

Example:

```text
server_xxxxxxxxx
```

Server keys must have unrestricted or elevated access only where explicitly intended.

They must NEVER be exposed to:

* browsers
* mobile applications
* Git repositories
* frontend environment variables

---

# 13. Authorization

Authentication and authorization must be separate.

Authentication answers:

```text
Who is this user?
```

Authorization answers:

```text
What can this user access?
```

Every database request should pass through an authorization layer.

Example:

```text
request
  ↓
API key validation
  ↓
JWT validation
  ↓
project validation
  ↓
user identity
  ↓
table authorization
  ↓
row authorization
  ↓
query
```

---

# 14. Row-Level Security

The platform must support row-level security concepts.

Example policy:

```text
Users can read their own profile.

Users can update their own profile.

Users cannot read another user's private records.
```

Policy example:

```text
SELECT:
user_id = auth.uid()

UPDATE:
user_id = auth.uid()
```

Policies should be represented as structured rules rather than allowing arbitrary executable SQL initially.

Example internal representation:

```json
{
  "table": "profiles",
  "operation": "select",
  "condition": {
    "field": "user_id",
    "operator": "eq",
    "value": "$auth.uid"
  }
}
```

Later, a more advanced policy engine can support expressions.

---

# 15. Realtime Database

Realtime is a core feature.

The initial implementation should use:

```text
PostgreSQL LISTEN/NOTIFY
+
WebSocket server
```

Flow:

```text
Database mutation
       ↓
PostgreSQL
       ↓
Event
       ↓
LISTEN/NOTIFY
       ↓
Realtime service
       ↓
WebSocket connections
       ↓
Subscribed clients
```

Supported initial events:

```text
INSERT
UPDATE
DELETE
```

Example client:

```ts
client
  .channel("users")
  .on("INSERT", callback)
  .on("UPDATE", callback)
  .on("DELETE", callback)
  .subscribe()
```

Realtime events must respect authorization.

Never broadcast a database event to a client that is not allowed to see that record.

---

# 16. Realtime Scaling Strategy

The first version can use PostgreSQL LISTEN/NOTIFY.

However, this should NOT be considered the final architecture for very large scale.

Future architecture:

```text
PostgreSQL
     ↓
CDC / WAL
     ↓
Message Broker
     ↓
Redis / NATS / Kafka
     ↓
Realtime Workers
     ↓
WebSocket Nodes
```

The WebSocket layer must therefore be implemented behind an abstraction:

```ts
interface RealtimeBroker {
  publish(event: RealtimeEvent): Promise<void>
  subscribe(channel: string): Promise<void>
}
```

Initial implementation:

```text
PostgresRealtimeBroker
```

Future:

```text
RedisRealtimeBroker
NatsRealtimeBroker
KafkaRealtimeBroker
```

This avoids rewriting the entire realtime system later.

---

# 17. WebSocket API

WebSocket endpoint:

```text
wss://api.example.com/realtime
```

Connection flow:

```text
WebSocket connection
        ↓
authenticate
        ↓
validate project
        ↓
validate JWT
        ↓
subscribe to channel
        ↓
check authorization
        ↓
receive events
```

Never allow arbitrary channel access without authorization.

---

# 18. Storage

Use Amazon S3 as the object storage layer.

Do NOT store user files on Render.

Storage abstraction:

```ts
interface StorageProvider {
  createBucket()
  deleteBucket()
  upload()
  download()
  delete()
  list()
  createSignedUploadUrl()
  createSignedDownloadUrl()
}
```

Initial provider:

```text
AWS S3
```

Future providers:

```text
Cloudflare R2
MinIO
Backblaze B2
```

This keeps the platform vendor-independent.

---

# 19. S3 Upload Architecture

Files should NOT normally pass through the API server.

Preferred flow:

```text
Client
   ↓
API
   ↓
Authorization
   ↓
Generate presigned URL
   ↓
Client
   ↓
AWS S3
```

Example:

```text
POST /storage/upload-url
```

Response:

```json
{
  "upload_url": "...",
  "object_key": "users/user_123/avatar.png",
  "expires_in": 300
}
```

The client uploads directly to S3.

This reduces:

* server bandwidth
* API CPU usage
* Render bandwidth
* latency

AWS supports presigned URLs specifically for time-limited object uploads/downloads. ([AWS Documentation][3])

---

# 20. Storage Security

Never expose the AWS access key or secret key to clients.

AWS credentials remain server-side.

S3 bucket should not be publicly writable.

Object access should be controlled through the API.

Example object key:

```text
projects/<project_id>/users/<user_id>/avatars/profile.png
```

Storage metadata should be stored in:

```text
storage.objects
```

Metadata:

```text
id
project_id
bucket_id
object_key
owner_id
mime_type
size
created_at
updated_at
```

---

# 21. Storage Buckets

Each project can create buckets.

Example:

```text
avatars
documents
images
videos
public
private
```

Buckets should support:

```text
public
private
```

Private objects require authorization.

Public objects can use controlled CDN/object URLs.

---

# 22. Dashboard

Build a web dashboard for developers.

Initial sections:

```text
Dashboard
Projects
Database
Authentication
Storage
Realtime
API Keys
Logs
Usage
Settings
Documentation
```

Project dashboard should display:

```text
Project URL
Project ID
Public API Key
Server API Key
Database status
Storage usage
Realtime connections
API requests
Authentication users
```

---

# 23. Project Creation

When a user creates a project:

```text
1. Create project metadata
2. Generate project ID
3. Create project database namespace
4. Create default auth configuration
5. Create default storage configuration
6. Generate API keys
7. Create default policies
8. Return project credentials
```

The process must be idempotent.

If provisioning fails midway, the system must know what completed and safely retry.

Do not create duplicate projects/resources on retry.

---

# 24. API Response Format

Use consistent JSON responses.

Success:

```json
{
  "data": {},
  "error": null
}
```

Error:

```json
{
  "data": null,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Authentication required"
  }
}
```

Never expose internal stack traces in production.

---

# 25. Error Codes

Create centralized error codes.

Examples:

```text
AUTH_REQUIRED
INVALID_TOKEN
TOKEN_EXPIRED
INVALID_API_KEY
PROJECT_NOT_FOUND
TABLE_NOT_FOUND
COLUMN_NOT_FOUND
PERMISSION_DENIED
RATE_LIMITED
INVALID_QUERY
INVALID_INPUT
STORAGE_ACCESS_DENIED
FILE_TOO_LARGE
RESOURCE_NOT_FOUND
INTERNAL_ERROR
```

---

# 26. Rate Limiting

Rate limiting must happen before expensive operations.

Initial strategy:

```text
IP-based rate limiting
+
API-key rate limiting
+
User-based rate limiting
```

Implement an abstraction:

```ts
interface RateLimiter {
  consume(key: string, limit: number, window: number): Promise<Result>
}
```

Initial lightweight implementation can use PostgreSQL or an in-memory strategy depending on deployment topology.

When horizontally scaling, move to:

```text
Redis
```

Do not make Redis mandatory for the first MVP if it makes the base infrastructure unnecessarily expensive.

---

# 27. Security Requirements

Security is not an optional feature.

Required:

* HTTPS only
* CORS configuration
* JWT validation
* API key validation
* password hashing
* refresh token rotation
* rate limiting
* request validation
* SQL injection protection
* parameterized queries
* file size limits
* MIME type validation
* upload authorization
* audit logs
* secret management
* secure cookies where applicable
* security headers
* CSRF protection where cookie authentication is used
* brute-force protection
* account lockout/throttling
* project isolation

Never trust:

```text
client-provided user_id
client-provided project_id
client-provided role
client-provided permissions
client-provided storage path
```

Derive sensitive identity information from authenticated credentials.

---

# 28. Audit Logs

Track security-sensitive events.

Examples:

```text
user.created
user.login
user.logout
password.changed
api_key.created
api_key.revoked
project.created
project.deleted
policy.created
policy.updated
storage.upload
storage.delete
table.created
table.deleted
permission.denied
```

Never log secrets.

Audit logs should contain:

```text
id
project_id
actor_id
action
resource_type
resource_id
ip_hash
user_agent
metadata
created_at
```

---

# 29. Database Migrations

Never manually mutate production schemas without migrations.

Use a migration system.

All schema changes should be versioned.

Example:

```text
migrations/
  001_initial.sql
  002_auth.sql
  003_storage.sql
  004_realtime.sql
```

Migration execution must be safe and track applied migrations.

---

# 30. Backend Technology

Preferred stack:

```text
Node.js
TypeScript
Fastify
PostgreSQL
WebSocket
Zod
JWT
Argon2
AWS SDK
```

Use Fastify or another lightweight HTTP framework.

Keep the architecture modular.

Recommended structure:

```text
src/

  app/
    server.ts
    config.ts

  modules/

    auth/
    projects/
    database/
    storage/
    realtime/
    api-keys/
    policies/
    usage/
    audit/

  infrastructure/

    postgres/
    s3/
    realtime/
    cache/

  middleware/

    auth.ts
    rateLimit.ts
    cors.ts
    errors.ts

  sdk/

  shared/

    errors/
    types/
    utils/
```

Avoid putting everything inside a single giant server file.

---

# 31. API Architecture

Use service/repository separation.

Example:

```text
HTTP Controller
      ↓
Service
      ↓
Repository
      ↓
Infrastructure
```

Example:

```text
UserController
      ↓
AuthService
      ↓
UserRepository
      ↓
Postgres
```

Do not let HTTP handlers directly contain complex SQL and business logic.

---

# 32. SDK

Create an official TypeScript SDK.

Package:

```text
@yourplatform/sdk
```

Example:

```ts
import { createClient } from "@yourplatform/sdk";

const client = createClient({
  url: "https://api.example.com",
  apiKey: "public_xxx"
});
```

Database:

```ts
const { data, error } = await client
  .from("users")
  .select("*")
  .eq("active", true);
```

Auth:

```ts
await client.auth.signUp({
  email,
  password
});
```

Storage:

```ts
await client.storage
  .from("avatars")
  .upload("profile.png", file);
```

Realtime:

```ts
client
  .channel("users")
  .on("INSERT", handler)
  .subscribe();
```

The SDK should hide HTTP implementation details.

---

# 33. SDK Design

The SDK should be a thin client.

Do not duplicate business logic inside the SDK.

The SDK should mainly handle:

* API URL
* authentication headers
* JWT persistence
* request formatting
* response parsing
* realtime connection
* storage operations

The server remains the source of truth.

---

# 34. Integration Configuration

Every project should have an Integration page.

Display:

```text
Project URL
Project ID
Public API Key
Server API Key
SDK installation
Environment variables
Authentication configuration
Storage configuration
Realtime configuration
```

Example:

```env
BACKEND_URL=https://api.example.com
BACKEND_PUBLIC_KEY=public_xxxxxxxxx
```

Never automatically display server secrets after initial creation.

Provide:

```text
Copy
Reveal
Rotate
Revoke
```

with appropriate security restrictions.

---

# 35. AI Coding Agent Integration

This is a major product feature.

The platform must assume that an AI coding agent does NOT know anything about our backend.

Therefore every project should have:

```text
AI Setup Prompt
```

The developer can copy this prompt into:

* Cursor
* Claude Code
* Codex
* Windsurf
* Gemini CLI
* GitHub Copilot
* other coding agents

The prompt should contain:

```text
Backend URL
Project ID
Public API key
SDK package
Required environment variables
Authentication instructions
Database instructions
Storage instructions
Realtime instructions
Security rules
Implementation requirements
```

Never put server secrets into the AI prompt.

---

# 36. Generated AI Setup Prompt

Generate a project-specific prompt like:

```text
You are integrating this application with the project's backend service.

Backend URL:
<PROJECT_URL>

Project ID:
<PROJECT_ID>

Public API Key:
<PUBLIC_KEY>

SDK:
<SDK_PACKAGE>

Instructions:

1. Install the official SDK.
2. Store the backend URL and public API key in environment variables.
3. Never expose server API keys in browser code.
4. Use the authentication API for user sessions.
5. Use database APIs through the SDK.
6. Use storage APIs for file uploads.
7. Use realtime subscriptions when live updates are required.
8. Never bypass authorization rules.
9. Do not create a second database layer.
10. Reuse existing project tables before creating new ones.
11. Follow the existing project's schema.
12. Never hardcode credentials.
13. Never send passwords or tokens to logs.
14. Ask before making destructive schema changes.

Before writing backend integration code:

- inspect the existing project
- identify the framework
- identify environment variable conventions
- install the SDK
- create the client
- verify authentication
- verify database connectivity
- verify storage connectivity

Use the project's existing architecture rather than introducing unnecessary abstractions.
```

The dashboard should generate this automatically based on the project configuration.

---

# 37. Documentation

Every feature must have developer documentation.

Documentation structure:

```text
/getting-started
/auth
/database
/storage
/realtime
/sdk
/security
/api-reference
/ai-integration
/troubleshooting
```

Every documentation page should contain:

```text
What it does
Installation
Configuration
Example
Common errors
Security notes
```

---

# 38. Developer Onboarding

The ideal onboarding should be:

```text
Create Project
      ↓
Copy API credentials
      ↓
Install SDK
      ↓
Paste AI setup prompt
      ↓
Ask coding agent to integrate
      ↓
Application connected
```

Target:

```text
< 5 minutes
```

from project creation to first successful API request.

---

# 39. CLI

After the core platform is stable, create a CLI.

Example:

```bash
npm install -g yourplatform
```

Commands:

```bash
yourplatform login

yourplatform projects list

yourplatform projects create

yourplatform db tables list

yourplatform db migrate

yourplatform storage buckets list

yourplatform secrets list
```

Future:

```bash
yourplatform init
```

should automatically configure an application.

---

# 40. Health Monitoring

Expose:

```text
GET /health
GET /ready
```

Health should check:

```text
API process
Database connectivity
Storage connectivity
Realtime subsystem
```

Do not perform expensive operations in the health endpoint.

Example:

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

# 41. Observability

Every request should have a request ID.

Example:

```text
x-request-id
```

Log:

```text
request_id
method
path
status
latency
project_id
user_id
```

Never log:

```text
password
JWT
refresh token
API secret
AWS credentials
file contents
```

Add metrics for:

```text
requests
errors
latency
database queries
active websocket connections
storage operations
authentication attempts
rate-limit violations
```

---

# 42. Scalability Strategy

The first version should be inexpensive but architected for horizontal scaling.

Initial:

```text
Render
  └── API Service
        ├── PostgreSQL
        └── AWS S3
```

Next:

```text
Render
  ├── API instances
  ├── Realtime instances
  └── Worker instances

AWS
  ├── PostgreSQL
  ├── S3
  └── Redis
```

Later:

```text
Load Balancer
      ↓
API Cluster
      ↓
Service Layer
      ├── Auth
      ├── Database
      ├── Storage
      ├── Realtime
      └── Workers
           ↓
     Message Broker
           ↓
      Infrastructure
```

The application must remain stateless wherever possible.

---

# 43. Important Scaling Rule

Do not build the system around Render persistent disks.

Render persistent disks are attached to a single service instance and prevent that service from being horizontally scaled in the normal way. ([Render][1])

Therefore:

```text
Render filesystem = temporary

PostgreSQL = persistent database

S3 = persistent files

Redis/message broker = distributed state

PostgreSQL metadata = platform state
```

---

# 44. Cost Strategy

The initial objective is:

```text
Keep infrastructure below approximately $20/month
```

while usage is low.

Do NOT provision expensive infrastructure before there is actual traffic.

Initial infrastructure should be approximately:

```text
Render
    API service

AWS
    Small PostgreSQL/RDS instance
    S3

Optional
    No Redis initially
```

The system must have abstractions for Redis and other infrastructure, but Redis should not be mandatory for the first deployment if it causes the baseline infrastructure cost to exceed the target.

As traffic increases:

```text
PostgreSQL
    ↓
larger instance
    ↓
read replicas
```

and:

```text
Realtime
    ↓
Redis/NATS
    ↓
multiple WebSocket servers
```

and:

```text
S3
    ↓
CloudFront
```

should be introduced only when required.

Do not optimize for hypothetical scale by paying for infrastructure that has no current workload.

---

# 45. AWS Architecture

Initial AWS resources:

```text
AWS
│
├── RDS PostgreSQL
│
└── S3
```

Future:

```text
AWS
│
├── RDS / Aurora PostgreSQL
├── S3
├── CloudFront
├── ElastiCache / Redis
├── SQS
└── CloudWatch
```

The API running on Render should communicate securely with AWS.

AWS credentials must be stored in Render environment variables/secrets.

Use IAM with least privilege.

The application should have only the permissions it actually needs.

---

# 46. Database Security

Do not expose PostgreSQL directly to the public internet unless absolutely required.

Prefer:

```text
Render API
    ↓
Private / restricted database access
    ↓
PostgreSQL
```

If networking constraints require public database access initially:

* use SSL
* strong credentials
* restricted inbound rules
* dedicated application database user
* least privilege
* rotate credentials
* do not expose admin credentials

---

# 47. Database Roles

Use separate database roles where practical.

Example:

```text
platform_admin
platform_api
migration_user
readonly_monitor
```

The API should not run using the database superuser.

Migrations should use a more privileged role than normal application queries.

---

# 48. Project Isolation

This is one of the most important requirements.

A request belonging to:

```text
Project A
```

must never be able to access:

```text
Project B
```

Every request must resolve:

```text
project_id
```

from trusted credentials/configuration.

Never trust a project ID supplied only in the request body.

All repositories should require project context.

Example:

```ts
repository.findUser({
  projectId,
  userId
});
```

rather than:

```ts
repository.findUser(userId);
```

---

# 49. Transaction Safety

Operations that modify multiple pieces of state should use database transactions.

Example:

```text
Create user
+
Create profile
+
Create session
```

must either:

```text
all succeed
```

or:

```text
all rollback
```

Do not leave partially-created resources.

---

# 50. Background Jobs

Do not execute expensive operations directly inside HTTP requests.

Future worker architecture:

```text
API
 ↓
Queue
 ↓
Worker
```

Suitable jobs:

```text
email sending
file processing
usage aggregation
cleanup
audit processing
analytics
webhook delivery
```

Initial implementation can use a simple database-backed job queue.

Later replace it with:

```text
Redis
SQS
```

---

# 51. Webhooks

Future feature:

```text
POST /webhooks
```

Developers should be able to receive events such as:

```text
user.created
user.deleted
database.insert
database.update
database.delete
storage.upload
storage.delete
```

Webhook delivery should eventually include:

* retry
* exponential backoff
* signatures
* idempotency
* delivery logs

Do not implement the complete webhook platform in the first MVP.

---

# 52. API Versioning

All public APIs must be versioned.

Initial:

```text
/api/v1
```

Never make breaking changes silently.

SDK versions should map clearly to API versions.

---

# 53. Idempotency

Critical mutation endpoints should support idempotency keys.

Example:

```text
Idempotency-Key: <unique-key>
```

Useful for:

* project creation
* payment-related operations
* storage metadata creation
* webhook processing
* resource provisioning

---

# 54. Security Headers

The API should include appropriate security headers.

At minimum consider:

```text
Strict-Transport-Security
X-Content-Type-Options
X-Frame-Options
Referrer-Policy
Content-Security-Policy
```

CORS must be configurable per project.

Do not use:

```text
Access-Control-Allow-Origin: *
```

for authenticated sensitive operations unless deliberately intended.

---

# 55. CORS

Each project should have configurable allowed origins.

Example:

```text
https://myapp.com
http://localhost:3000
http://localhost:5173
```

Store:

```text
project.allowed_origins
```

The dashboard should allow developers to add/remove origins.

---

# 56. File Upload Security

For every upload:

* validate authenticated user
* validate project
* validate bucket
* validate bucket permissions
* enforce maximum file size
* validate content type
* validate file extension
* generate safe object key
* prevent path traversal
* never trust client-provided filename
* optionally scan files in future

Never construct S3 keys directly from arbitrary client strings without sanitization.

---

# 57. Secrets Management

Environment variables:

```text
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_S3_BUCKET
```

Never commit these.

Use:

```text
.env
```

locally.

Production secrets should be configured through Render secret/environment configuration.

---

# 58. Environment Separation

Maintain:

```text
development
staging
production
```

Each environment should have separate:

```text
database
S3 bucket
JWT secrets
API keys
configuration
```

Never use production credentials locally.

---

# 59. Testing

Required tests:

```text
unit tests
integration tests
API tests
authentication tests
authorization tests
storage tests
realtime tests
security tests
```

Critical test cases:

```text
User A cannot access User B's private data.

Project A cannot access Project B.

Invalid JWT is rejected.

Expired JWT is rejected.

Revoked API key is rejected.

Unauthorized storage access is rejected.

Oversized files are rejected.

SQL injection attempts fail.

Rate limiting works.

Realtime events respect authorization.
```

---

# 60. Development Order

Do NOT build everything simultaneously.

Build in this order.

## Phase 1: Foundation

```text
TypeScript
Fastify
PostgreSQL
configuration
logging
error handling
health checks
Docker
Render deployment
```

## Phase 2: Projects

```text
accounts
projects
project membership
API keys
project configuration
```

## Phase 3: Database

```text
table metadata
CRUD
query builder
filters
pagination
indexes
migrations
```

## Phase 4: Authentication

```text
users
password hashing
JWT
refresh tokens
sessions
email verification
password reset
```

## Phase 5: Authorization

```text
project isolation
policies
row-level authorization
role system
```

## Phase 6: Storage

```text
S3
buckets
objects
presigned upload
presigned download
metadata
permissions
```

## Phase 7: Realtime

```text
WebSockets
Postgres LISTEN/NOTIFY
subscriptions
authorization
database events
```

## Phase 8: SDK

```text
TypeScript SDK
auth
database
storage
realtime
```

## Phase 9: Dashboard

```text
project management
database UI
auth UI
storage UI
API keys
logs
usage
integration
AI prompt
```

## Phase 10: Developer Experience

```text
documentation
CLI
generated config
AI coding-agent prompt
examples
templates
```

---

# 61. MVP Definition

The MVP is complete when a developer can do this:

```text
1. Create account.

2. Create project.

3. Receive:
   PROJECT_URL
   PUBLIC_API_KEY

4. Create a table:

   users
   id
   name
   email

5. Install SDK.

6. Initialize client.

7. Insert data.

8. Query data.

9. Create a user account.

10. Authenticate.

11. Apply authorization policy.

12. Upload a file.

13. Receive a signed storage URL.

14. Subscribe to realtime changes.

15. Receive INSERT/UPDATE/DELETE events.

16. Copy AI setup prompt.

17. Give prompt to an AI coding agent.

18. Agent integrates the backend successfully.
```

If these work reliably, we have a real product.

---

# 62. Repository Structure

Recommended monorepo:

```text
backend-platform/

├── apps/
│   ├── api/
│   ├── dashboard/
│   └── docs/
│
├── packages/
│   ├── sdk/
│   ├── types/
│   ├── config/
│   └── client/
│
├── infrastructure/
│   ├── migrations/
│   ├── docker/
│   └── scripts/
│
├── docs/
│
├── tests/
│
├── .env.example
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

Use pnpm workspaces unless there is a strong reason not to.

---

# 63. API Client Contract

The SDK should eventually expose:

```ts
client.auth
client.from
client.storage
client.channel
client.functions
client.projects
```

Only implement the modules that actually exist.

Do not create fake APIs for unfinished features.

---

# 64. Database API Example

Developer experience should look like:

```ts
const { data, error } = await client
  .from("tasks")
  .select("*")
  .eq("completed", false)
  .order("created_at", { ascending: false })
  .limit(20);
```

Insert:

```ts
const { data, error } = await client
  .from("tasks")
  .insert({
    title: "Build backend",
    completed: false
  });
```

Update:

```ts
await client
  .from("tasks")
  .update({
    completed: true
  })
  .eq("id", taskId);
```

Delete:

```ts
await client
  .from("tasks")
  .delete()
  .eq("id", taskId);
```

The API implementation must convert these operations into safe parameterized queries.

---

# 65. Realtime Example

Developer:

```ts
const channel = client
  .channel("tasks")
  .on("INSERT", event => {
    console.log(event);
  })
  .on("UPDATE", event => {
    console.log(event);
  })
  .on("DELETE", event => {
    console.log(event);
  });

await channel.subscribe();
```

The server must verify that the authenticated user can access the relevant table/rows before delivering events.

---

# 66. Storage Example

```ts
const { data, error } = await client.storage
  .from("avatars")
  .upload("profile.png", file);
```

Download:

```ts
const { data, error } = await client.storage
  .from("avatars")
  .download("profile.png");
```

Signed URL:

```ts
const { data } = await client.storage
  .from("avatars")
  .createSignedUrl("profile.png", 3600);
```

---

# 67. Developer Experience Goal

The platform should feel like:

```text
Firebase simplicity
+
Supabase/Postgres power
+
AI-agent friendliness
+
Low infrastructure cost
```

The user should not need to understand:

```text
PostgreSQL connection pooling
JWT internals
S3 credentials
WebSocket infrastructure
AWS IAM
database migrations
```

to build a normal application.

---

# 68. What NOT To Do

Do NOT:

* store files on Render
* expose AWS credentials
* expose PostgreSQL directly to browsers
* allow arbitrary SQL from public clients
* use one global API key
* trust client-provided user IDs
* trust client-provided project IDs
* use database superuser credentials in the API
* store plaintext passwords
* put refresh tokens in logs
* broadcast unauthorized realtime events
* make Redis mandatory before it is needed
* build Kubernetes for the MVP
* build microservices before boundaries are clear
* implement GraphQL before REST is stable
* create a giant monolithic server file
* hardcode secrets
* make the SDK responsible for authorization
* assume Render local storage is persistent
* design the first version around a single machine

---

# 69. Engineering Principle

Build the MVP as a modular monolith.

Not:

```text
20 microservices
```

and not:

```text
one giant server.ts
```

Instead:

```text
Modular Monolith
      ↓
Clear Service Boundaries
      ↓
Stable Interfaces
      ↓
Extract Services Only When Needed
```

This gives us the fastest development speed without destroying the future scaling path.

---

# 70. Final Architecture Target

Initial:

```text
                         INTERNET
                             │
                             ▼
                    ┌─────────────────┐
                    │     Render      │
                    │                 │
                    │   API Server    │
                    │   TypeScript    │
                    │   Fastify       │
                    └───────┬─────────┘
                            │
                 ┌──────────┴───────────┐
                 │                      │
                 ▼                      ▼
          ┌───────────────┐       ┌─────────────┐
          │ PostgreSQL    │       │   AWS S3    │
          │               │       │             │
          │ DB + Auth     │       │   Storage   │
          │ + Metadata    │       │             │
          └───────────────┘       └─────────────┘
                 │
                 ▼
          LISTEN / NOTIFY
                 │
                 ▼
          WebSocket Server
```

Scaled:

```text
                         INTERNET
                             │
                             ▼
                      LOAD BALANCER
                             │
             ┌───────────────┼───────────────┐
             ▼               ▼               ▼
          API #1           API #2          API #N
             │               │               │
             └───────────────┼───────────────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
                   ▼                   ▼
              PostgreSQL             Redis
                   │                   │
                   │                   ▼
                   │              Realtime
                   │               Nodes
                   │
                   ▼
                  S3
```

The architecture should evolve toward this only when traffic justifies it.

---

# 71. First Coding Task

Before implementing individual features, create the project foundation.

The coding agent should first:

1. Create the monorepo.
2. Configure TypeScript.
3. Configure pnpm.
4. Create the API application.
5. Configure Fastify.
6. Add environment configuration.
7. Add structured logging.
8. Add centralized error handling.
9. Add `/health`.
10. Add `/ready`.
11. Add PostgreSQL connection pool.
12. Add database migration system.
13. Add Docker configuration.
14. Add `.env.example`.
15. Add Render deployment configuration.
16. Add basic CI.
17. Add test framework.
18. Create the initial platform database schema.
19. Create project isolation primitives.
20. Do NOT implement the entire product in one pass.

After this foundation is stable, implement each module independently.

---

# 72. Definition of Done

A feature is not complete merely because its endpoint works.

Every production feature must include:

```text
API
Validation
Authorization
Error handling
Logging
Tests
Documentation
SDK support where applicable
Dashboard support where applicable
Security review
```

---

# 73. Product Priority

Always prioritize:

```text
Security
Correctness
Developer Experience
Reliability
Performance
Cost
Scalability
```

Do not sacrifice security for development speed.

Do not sacrifice simplicity for hypothetical scale.

Do not sacrifice project isolation for convenience.

---

# 74. AI Coding Agent Rule

When working on this repository, always read this `context.md` before making architectural decisions.

Do not introduce a new infrastructure dependency without checking:

1. Why it is necessary.
2. Whether PostgreSQL can solve the problem.
3. Whether the feature can be abstracted.
4. Whether it increases the baseline monthly infrastructure cost.
5. Whether it prevents horizontal scaling.
6. Whether it creates a security concern.

Prefer boring, well-understood technologies.

Prefer modularity over premature microservices.

Prefer stateless services.

Prefer managed durable infrastructure.

Prefer direct S3 uploads.

Prefer PostgreSQL for relational state.

Prefer abstractions around infrastructure providers.

---

# 75. Current Technology Decisions

```text
Language:
TypeScript

Runtime:
Node.js

HTTP:
Fastify

Database:
PostgreSQL

Authentication:
JWT + Argon2id

Realtime:
WebSocket + PostgreSQL LISTEN/NOTIFY initially

Storage:
AWS S3

Hosting:
Render

SDK:
TypeScript

Validation:
Zod

Package Manager:
pnpm

Architecture:
Modular Monolith

Deployment:
Docker + Render

Database Access:
Connection Pool

Initial Cache:
None / lightweight implementation

Future Cache:
Redis

Future Queue:
Redis / SQS

Future CDN:
CloudFront
```

---

# 76. Project Success Criteria

The project should eventually be judged on one question:

> Can a developer who knows nothing about our backend connect their existing application to it in a few minutes, with the help of an AI coding agent, without accidentally exposing credentials or breaking authorization?

If the answer is yes, the platform is succeeding.

The goal is not to build another complicated infrastructure platform.

The goal is to make:

```text
Backend as easy as installing an SDK.
```

---

# 77. AI Integration Prompt Template

The dashboard must eventually generate a project-specific version of the following:

```text
You are working on an application that uses [PLATFORM_NAME] as its backend.

Do not create a separate backend unless explicitly requested.

Backend configuration:

PROJECT_URL:
[PROJECT_URL]

PROJECT_ID:
[PROJECT_ID]

PUBLIC_API_KEY:
[PUBLIC_API_KEY]

SDK:
[SDK_PACKAGE]

Your task is to integrate the existing application with this backend.

Before making changes:

1. Inspect the existing project structure.
2. Identify the framework and package manager.
3. Identify existing environment variable conventions.
4. Check whether a backend client already exists.
5. Do not duplicate an existing backend integration.

Install and configure the official SDK.

Store:

[PLATFORM_URL_VARIABLE]=[PROJECT_URL]
[PLATFORM_PUBLIC_KEY_VARIABLE]=[PUBLIC_API_KEY]

Never put a server API key or private credential into frontend code.

Use the platform for:

- Authentication
- Database operations
- File storage
- Realtime subscriptions

Authentication:

Use the official auth APIs.

Do not implement a second JWT system.

Database:

Use the official SDK query API.

Do not construct raw SQL in frontend code.

Before creating tables, inspect the existing schema.

Do not delete or modify existing tables without explicit approval.

Authorization:

Assume database access policies are enforced server-side.

Do not bypass them.

Storage:

Use the official storage API.

For browser uploads, use the platform's signed upload flow.

Never expose AWS credentials.

Realtime:

Use the platform's realtime channel API when the UI requires live updates.

Do not implement a second WebSocket server unless explicitly required.

Environment variables:

Keep credentials in environment variables.

Never hardcode credentials into source files.

Security:

Never log passwords, access tokens, refresh tokens, API keys, or private credentials.

Never trust client-provided user IDs for authorization.

Use the authenticated session identity.

Development:

First connect the client.

Then verify authentication.

Then verify database access.

Then verify storage.

Then verify realtime.

Only after these work should you modify application features.

Use the existing application's architecture and coding conventions.

Avoid unnecessary dependencies.

Do not rewrite unrelated parts of the application.

If the requested feature conflicts with backend security policies, explain the conflict before implementing a workaround.
```

# End of context.md

### One architectural change I'd make to your original idea

I would **not** try to make the first version literally “Firebase + Supabase + AWS” all at once.

Build this:

**Your platform → PostgreSQL + Auth + REST + Realtime + S3**

That's already a serious product.

The Supabase architecture is a useful reference here: PostgreSQL sits at the center, with auth, REST, realtime and storage built around it. ([Supabase][2])

And the most important cost-saving decision is **not putting uploaded files through Render**. Generate a short-lived S3 presigned URL and let the user's browser upload directly to S3. ([AWS Documentation][3])

For the initial low-cost deployment, I'd therefore target:

```text
Render
└── API + WebSocket server

AWS
├── PostgreSQL
└── S3

Later, only when needed:
├── Redis
├── CloudFront
├── SQS
└── Read replicas
```

That gives you a credible path from **one inexpensive instance** to a horizontally scaled BaaS without having to rewrite the product.

One caveat: if the hard requirement is **under $20/month including Render + AWS at all times**, we should validate the exact current AWS/Render instance choices before locking the production infrastructure. The architecture above is designed to minimize the baseline, but the actual bill depends on region, database instance, storage, bandwidth and usage. Render itself recommends managed Postgres for relational data rather than putting a database on a persistent disk. ([Render][4])

[1]: https://render.com/docs/disks?utm_source=chatgpt.com "Persistent Disks – Render Docs"
[2]: https://supabase.com/docs/guides/getting-started/architecture?utm_source=chatgpt.com "Architecture | Supabase Docs"
[3]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html?utm_source=chatgpt.com "Download and upload objects with presigned URLs - Amazon Simple Storage Service"
[4]: https://render.com/docs/service-types?utm_source=chatgpt.com "Services and Service Types – Render Docs"
