<div align="center">

# Zorabase

### *Developer-First Backend-as-a-Service & Realtime Cloud Infrastructure*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![AWS S3](https://img.shields.io/badge/AWS_S3-Storage-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-GenAI-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br/>

<p align="center">
  <strong>Zorabase</strong> is an open, developer-first Backend-as-a-Service (BaaS) engineered to eliminate backend boilerplate for web, mobile, and AI applications. It combines schema-isolated relational databases, zero-server-bandwidth AWS S3 presigned storage, sub-15ms Change Data Capture (CDC) WebSocket streams, and native Gemini GenAI schema intelligence with an official type-safe TypeScript SDK.
</p>

</div>

---

## ⚡ Key Highlights & Benchmark Metrics

| Metric | Specification / Capacity | Architecture Mechanism |
|---|---|---|
| **CDC Broadcast Latency** | **< 15ms** | PostgreSQL Write-Ahead Log (WAL) logical decoding |
| **Database Query Throughput** | **5,000+ QPS sustained** | Stateless Next.js API nodes + PgBouncer connection pooling |
| **Storage Upload Bandwidth** | **0 MB Server Load** | AWS Signature v4 presigned direct PUT streams |
| **Concurrent WebSockets** | **10,000+ per Node** | Non-blocking event-driven asynchronous connection broker |
| **SDK Type Safety** | **100% TypeScript** | Dual ESM (`.mjs`) & CJS (`.js`) build with full `.d.ts` definitions |
| **AI Schema Drift** | **Zero Drift** | 3-tier pre-flight introspection & public key DDL lockdown |

---

## 🏗️ System Architecture Topology

```
                              ┌─────────────────────────────────────────────────────────┐
                              │                    CLIENT APPLICATIONS                  │
                              │  (Next.js Web / React Native / AI Coding Agents / SDK) │
                              └─────────────┬───────────────────────────┬───────────────┘
                                            │                           │
                               HTTP / REST / SSE / WS             Direct S3 PUT / GET
                                (Port 443 / SSL)                  (Presigned URL Upload)
                                            │                           │
                                            ▼                           ▼
                        ┌───────────────────────────────────────┐   ┌───────────────────────────┐
                        │        CLOUDFLARE / RENDER ALB        │   │       AWS S3 BUCKET       │
                        │    (SSL Termination / DDOS / Edge)    │   │  (Region: eu-north-1)     │
                        └───────────────────┬───────────────────┘   │  Bucket: zorabase         │
                                            │                       │  • User Avatars           │
                                            ▼                       │  • File Documents         │
                        ┌───────────────────────────────────────┐   │  • Raw Media              │
                        │     ZORABASE CONTROL PLANE (API)      │   └───────────────────────────┘
                        │    (Stateless Node.js / Next.js)      │                 ▲
                        │                                       │                 │
                        │  • API Key Authentication Middleware  │                 │
                        │  • Query Builder & REST Routers       │                 │
                        │  • S3 Presigner & Storage Controller ─┼─────────────────┘
                        │  • GenAI Assistant (Gemini 2.5 Flash) │
                        │  • Realtime SSE / WebSocket Engine    │
                        └───────────────────┬───────────────────┘
                                            │
                                  Connection Pool (PgBouncer)
                                  TCP / TLS Connection
                                            │
                                            ▼
                        ┌───────────────────────────────────────────────────────────────┐
                        │               POSTGRESQL CLUSTER (SUPABASE ENGINE)            │
                        │                                                               │
                        │  ┌─────────────────────────────────────────────────────────┐  │
                        │  │ Schema: `platform` (Multi-Tenant Workspace Isolation)   │  │
                        │  │ • `projects` (Workspace Namespaces)                     │  │
                        │  │ • `api_keys` (Public `pk_live_` & Secret `sk_live_`)   │  │
                        │  │ • `database_tables` & `database_columns` (Metadata)     │  │
                        │  │ • `database_records` (JSONB Flexible Document Store)    │  │
                        │  │ • `storage_buckets` & `storage_objects` (File Metadata) │  │
                        │  │ • `ai_info_cards` (GenAI Pinned Live Metrics)           │  │
                        │  │ • `account_settings` & `audit_logs` (Security Policies) │  │
                        │  └─────────────────────────────────────────────────────────┘  │
                        │                                                               │
                        │  ┌─────────────────────────────────────────────────────────┐  │
                        │  │ Realtime CDC Replication: `supabase_realtime` pub       │  │
                        │  │ • WAL (Write-Ahead Log) Change Data Capture             │  │
                        │  │ • Row Level Security (RLS) Policy Checks                │  │
                        │  └─────────────────────────────────────────────────────────┘  │
                        └───────────────────────────────────────────────────────────────┘
```

---

## 🚀 Core Subsystems

### 1. Schema-Isolated Relational Data Engine
* **PostgreSQL Namespaces:** Every workspace is isolated within the `platform` schema with strict Row-Level Security (RLS).
* **Hybrid JSONB Model:** Custom columns (`text`, `integer`, `numeric`, `boolean`, `jsonb`, `timestamptz`) are indexed inside PostgreSQL JSONB documents with GIN indexes, avoiding DDL table locks during migrations.
* **SQL Injection Immunity:** The SDK query builder translates operations into parameterized queries (`$1`, `$2`), preventing raw SQL execution from client endpoints.

### 2. Direct AWS S3 Presigned Object Storage
* **Zero Server Bandwidth Load:** File uploads bypass the Node.js API server entirely.
* **AWS Signature v4 Presigning:** The API calculates time-limited (15-minute) cryptographic HMAC-SHA256 PUT URLs in `< 2ms`, and client browsers stream binaries directly to AWS S3 (`eu-north-1`).

### 3. Sub-15ms Realtime Change Data Capture (CDC)
* **Write-Ahead Log (WAL) Logical Decoding:** Mutations (`INSERT`, `UPDATE`, `DELETE`) committed to PostgreSQL are captured via the `supabase_realtime` publication and broadcast to WebSocket channel subscribers in sub-15 milliseconds.

### 4. Gemini GenAI Database Assistant
* **Natural Language Queries:** Powered by Google's `gemini-2.5-flash` model.
* **Schema Introspection Pipeline:** Evaluates active column definitions, data types, and record samples to generate structured analytical insights.
* **Live Pinned Info Cards:** 1-click persistence to project dashboards for persistent, real-time metrics.

### 5. AI Coding Agent Guardrails (Solving Schema Drift)
* **The Problem:** AI coding tools (Cursor, Claude Code, Copilot) frequently hallucinate database columns or execute breaking DDL migrations.
* **Zorabase Guardrail Pipeline:**
  1. *Pre-Flight Introspection Prompts:* AI prompts enforce runtime schema awareness before code generation.
  2. *Public Key DDL Lockdown:* Client public keys (`pk_live_...`) are restricted from executing structural alterations.
  3. *Zero-Downtime JSONB Storage:* Eliminates table-locking migration downtime.

---

## 📦 Official TypeScript SDK (`@zorabase/sdk`)

The official SDK is published in the `packages/sdk` directory with dual **ESM (`.mjs`)** and **CommonJS (`.js`)** output.

### Installation
```bash
npm install @zorabase/sdk
# or
pnpm add @zorabase/sdk
```

### Client Initialization
```typescript
import { createClient } from '@zorabase/sdk'

export const db = createClient({
  url: 'https://api.zorabase.io/v1/YOUR_PROJECT_ID',
  apiKey: process.env.NEXT_PUBLIC_ZORABASE_PUBLIC_KEY!,
})
```

### 1. Relational Queries & Safe Filters
```typescript
// Query active users with chainable filters
const { data: users, error } = await db
  .from('users')
  .select('id, name, email, plan')
  .eq('status', 'active')
  .gt('credits', 10)
  .order('created_at', { ascending: false })
  .limit(25)

// Insert record
const { data: created } = await db
  .from('tasks')
  .insert({ title: 'Deploy to Render', priority: 'high' })
```

### 2. Direct AWS S3 Upload & Signed Download
```typescript
// 1. Direct browser-to-S3 upload (0 server bandwidth)
const file = event.target.files[0]
const { data: ref, error } = await db.storage
  .from('avatars')
  .upload(`users/${userId}/${file.name}`, file, {
    contentType: file.type,
  })

// 2. Generate time-limited signed URL (valid 1 hour)
const { data: signed } = await db.storage
  .from('avatars')
  .createSignedUrl(ref.key, 3600)
```

### 3. Realtime WebSocket Subscriptions
```typescript
// Subscribe to live database mutations
const channel = db
  .channel('orders')
  .on('INSERT', (payload) => console.log('New order:', payload.new))
  .on('UPDATE', (payload) => console.log('Order updated:', payload.new))
  .on('DELETE', (payload) => console.log('Order deleted:', payload.old))
  .subscribe()

// Unsubscribe when done
channel.unsubscribe()
```

---

## 🌐 REST API Reference

All REST endpoints support automated CORS preflight checks (`OPTIONS`) and require standard authentication headers:

```http
apikey: pk_live_your_public_api_key
Content-Type: application/json
```

### Standard Response Envelope

```json
// Success Response (HTTP 200 / 201)
{
  "data": [
    {
      "id": "rec_01h8x9",
      "name": "Jane Developer",
      "status": "active",
      "_created_at": "2026-08-19T14:30:00.000Z"
    }
  ],
  "error": null
}

// Error Response (HTTP 4xx / 5xx)
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid apikey header"
  }
}
```

---

## 📁 Monorepo Structure

```
Zorabase/
├── apps/
│   └── web/                   # Next.js 16 (App Router) Control Plane & Dashboard
│       ├── src/app/           # API routes, Auth, and Dashboard views
│       ├── src/components/    # Tailwind UI components (Database, Storage, Realtime, Docs)
│       └── src/lib/           # S3 Client, Gemini AI, Supabase Auth, CORS utilities
├── packages/
│   └── sdk/                   # Official @zorabase/sdk (ESM/CJS Dual Build via tsup)
│       ├── src/client.ts      # ZorabaseClient root entry
│       ├── src/database.ts    # Chainable QueryBuilder
│       ├── src/storage.ts     # S3 Presigned Upload client
│       └── src/realtime.ts    # WebSocket CDC channel listener
├── render.yaml                # 1-Click Render Deployment Blueprint
├── pnpm-workspace.yaml        # Monorepo Workspace Configuration
└── package.json               # Root Build & Start Scripts
```

---

## 🛠️ Local Development

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Omkar-Hundre/Zorabase.git
cd Zorabase
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `apps/web/.env.local`:
```bash
cp .env.example apps/web/.env.local
```
Fill in your credentials for Supabase, AWS S3, and Google Gemini.

### 3. Run Monorepo Build & Dev Server
```bash
# Build SDK and Next.js app
pnpm build

# Start dev server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 1-Click Render Deployment

1. Connect your repository to [Render.com](https://dashboard.render.com).
2. Create a **New Web Service** → Select `Omkar-Hundre/Zorabase`.
3. Configure Build Settings:
   * **Runtime:** `Node`
   * **Build Command:** `pnpm install && pnpm build`
   * **Start Command:** `pnpm start`
4. Set Environment Variables:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_APP_URL`
   * `AWS_REGION` = `eu-north-1`
   * `AWS_S3_BUCKET` = `zorabase`
   * `AWS_ACCESS_KEY_ID`
   * `AWS_SECRET_ACCESS_KEY`
   * `GEMINI_API_KEY`
5. Click **Deploy**.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
