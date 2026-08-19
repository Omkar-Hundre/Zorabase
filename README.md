# Zorabase

> **Developer-First Backend-as-a-Service & Realtime Cloud Infrastructure**

Zorabase is an open Backend-as-a-Service (BaaS) engineered to eliminate backend boilerplate for web, mobile, and AI applications. It combines schema-isolated relational databases, zero-server-bandwidth AWS S3 presigned object storage, sub-15ms Change Data Capture (CDC) WebSocket streams, and native Gemini GenAI schema intelligence with an official type-safe TypeScript SDK.

---

## Key Architectural Capabilities

* 🗄️ **Schema-Isolated Relational Data:** PostgreSQL namespaces with custom typed columns (`text`, `integer`, `numeric`, `boolean`, `jsonb`, `timestamptz`), Row-Level Security (RLS), and parameterized queries.
* 📦 **Direct S3 Presigned Object Storage:** Cryptographically signed AWS Signature v4 tokens allow browsers and mobile apps to stream files directly to Amazon S3 (`eu-north-1`), with **0 MB server bandwidth load**.
* ⚡ **Sub-15ms Realtime Change Data Capture:** PostgreSQL Write-Ahead Log (WAL) logical decoding broadcasts database mutations across connected WebSockets in real time.
* 🤖 **Gemini GenAI Database Assistant:** Natural language SQL query analysis powered by `gemini-2.5-flash` with 1-click **Pin as Info Card** live dashboard widgets.
* 🛡️ **AI Coding Agent Guardrails:** Pre-flight schema introspection prompts and public key DDL lockdowns prevent autonomous coding agents (Cursor, Claude Code) from hallucinating breaking database migrations.
* 📦 **Official TypeScript SDK (`@zorabase/sdk`):** Zero-dependency, dual ESM (`.mjs`) and CommonJS (`.js`) package with complete `.d.ts` type declarations.

---

## Monorepo Architecture

```
Zorabase/
├── apps/
│   └── web/                   # Next.js 16 (App Router) Control Plane & Dashboard
├── packages/
│   └── sdk/                   # Official @zorabase/sdk (ESM/CJS Dual Build)
├── INTERVIEW_SYSTEM_ARCHITECTURE.md  # Comprehensive 35-Question Technical Guide
├── Zorabase_System_Architecture_Guide.pdf # Formatted PDF Reference Guide
├── render.yaml                # 1-Click Render Deployment Blueprint
└── package.json               # Root Workspace Scripts
```

---

## Quickstart (Local Development)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `apps/web/.env.local`:
```bash
cp .env.example apps/web/.env.local
```
Fill in your Supabase, AWS S3, and Google Gemini credentials.

### 3. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## TypeScript SDK Usage

```typescript
import { createClient } from '@zorabase/sdk'

export const db = createClient({
  url: 'https://api.zorabase.io/v1/PROJECT_ID',
  apiKey: process.env.NEXT_PUBLIC_ZORABASE_PUBLIC_KEY!,
})

// 1. Relational Query with Safe Filters
const { data: users, error } = await db
  .from('users')
  .select('id, name, email, status')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(20)

// 2. Direct S3 Upload (Presigned Flow)
const { data: fileRef } = await db.storage
  .from('avatars')
  .upload(`users/${userId}/avatar.png`, fileBlob)

// 3. Realtime WebSocket Subscription
const channel = db
  .channel('orders')
  .on('INSERT', (payload) => console.log('New order:', payload.new))
  .subscribe()
```

---

## Deployment on Render

This repository includes a [`render.yaml`](render.yaml) blueprint:
1. Connect your GitHub repository to [Render.com](https://dashboard.render.com).
2. Create a **New Web Service** → Select this repository.
3. Build Command: `pnpm install && pnpm build`
4. Start Command: `pnpm start`
5. Configure your environment variables in the Render dashboard.

---

## Documentation & Architecture Guide

* 📄 **[Technical System Architecture & Interview Guide (Markdown)](INTERVIEW_SYSTEM_ARCHITECTURE.md)**
* 📑 **[System Architecture Guide (PDF)](Zorabase_System_Architecture_Guide.pdf)**

---

## License

MIT © Zorabase
