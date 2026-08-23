'use client'

import { useState } from 'react'

const navSections = [
  { id: 'playground', title: 'Interactive API Playground', tag: 'Live' },
  { id: 'introduction', title: '1. Introduction & Core Concepts' },
  { id: 'mcp-server', title: '2. MCP Server & AI Agents', tag: 'New' },
  { id: 'ai-guardrails', title: '3. AI Coding Agent Guardrails', tag: 'Critical' },
  { id: 'database-engine', title: '4. Database & Query Engine' },
  { id: 'filter-matrix', title: '5. Filter Operators Reference' },
  { id: 'storage-architecture', title: '6. S3 Presigned Storage' },
  { id: 'realtime-cdc', title: '7. Realtime CDC & WebSockets' },
  { id: 'sdk-reference', title: '8. TypeScript SDK Reference' },
  { id: 'rest-api-spec', title: '9. REST API & Error Codes' },
  { id: 'security-cors', title: '10. Security, CORS & Rate Limits' },
]

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('playground')

  // Playground State
  const [method, setMethod] = useState<'GET' | 'POST'>('GET')
  const [endpoint, setEndpoint] = useState('/api/health')
  const [apiKeyInput, setApiKeyInput] = useState('pk_live_demo_test_key_12345678')
  const [requestBody, setRequestBody] = useState('{\n  "name": "Jane Developer",\n  "email": "jane@example.com",\n  "status": "active"\n}')
  const [responseStatus, setResponseStatus] = useState<number | null>(null)
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [responseOutput, setResponseOutput] = useState<string | null>(null)
  const [executing, setExecuting] = useState(false)

  async function handleExecutePlayground() {
    setExecuting(true)
    setResponseStatus(null)
    setResponseTime(null)
    setResponseOutput(null)

    const start = performance.now()
    try {
      const headers: Record<string, string> = {
        'apikey': apiKeyInput,
        'Content-Type': 'application/json',
      }

      const res = await fetch(endpoint, {
        method,
        headers,
        body: method === 'POST' ? requestBody : undefined,
      })

      const end = performance.now()
      const timeMs = Math.round(end - start)
      setResponseTime(timeMs)
      setResponseStatus(res.status)

      const json = await res.json()
      setResponseOutput(JSON.stringify(json, null, 2))
    } catch (err: any) {
      const end = performance.now()
      setResponseTime(Math.round(end - start))
      setResponseStatus(500)
      setResponseOutput(JSON.stringify({ error: err.message || 'Request execution failed' }, null, 2))
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-xl border border-white/[0.08] bg-gradient-to-r from-indigo-500/[0.08] via-white/[0.02] to-transparent p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Zorabase Technical Documentation</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400 max-w-3xl leading-relaxed">
            Exhaustive architectural specifications, SDK lifecycles, Change Data Capture (CDC) mechanics, and API protocols for engineering teams building on Zorabase.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('playground')}
          className="flex items-center gap-2 h-8 px-3.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>Open API Playground</span>
        </button>
      </div>

      {/* Main Documentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Table of Contents Menu (3 cols) */}
        <div className="lg:col-span-3 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-3 block mb-2">
            Documentation Index
          </span>
          {navSections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${activeTab === s.id
                  ? 'bg-indigo-600/10 border border-indigo-500/30 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
            >
              <span className="truncate pr-2">{s.title}</span>
              {s.tag && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold uppercase ${s.tag === 'Live'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                >
                  {s.tag}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right Content View (9 cols) */}
        <div className="lg:col-span-9 space-y-8 leading-relaxed text-zinc-300 text-xs">
          {/* ─── 0. Interactive API Playground ─── */}
          {activeTab === 'playground' && (
            <div className="space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <h2 className="text-base font-bold text-zinc-100">Live Interactive API Console & Request Runner</h2>
                <p className="text-zinc-400 mt-1">
                  Execute authenticated HTTP requests directly against Zorabase endpoints in real time. Inspect response status codes, latencies in milliseconds, and structured JSON payloads.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-5 space-y-4">
                {/* Method & URL Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="bg-[#08080a] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-bold font-mono text-indigo-400 outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>

                  <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/api/health or /api/v1/PROJECT_ID/data/users"
                    className="flex-1 bg-[#08080a] border border-white/[0.08] rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-200 outline-none focus:border-indigo-500/50"
                  />

                  <button
                    onClick={handleExecutePlayground}
                    disabled={executing}
                    className="h-9 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white transition-colors shrink-0"
                  >
                    {executing ? 'Sending...' : 'Execute Request'}
                  </button>
                </div>

                {/* API Key Header Input */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1 font-mono">Request Header: apikey</label>
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full bg-[#08080a] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-300 outline-none"
                  />
                </div>

                {/* Body (for POST) */}
                {method === 'POST' && (
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1 font-mono">Request JSON Payload</label>
                    <textarea
                      rows={4}
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="w-full bg-[#08080a] border border-white/[0.08] rounded-lg p-3 text-xs font-mono text-zinc-200 outline-none leading-relaxed"
                    />
                  </div>
                )}

                {/* Response Viewer */}
                {responseStatus !== null && (
                  <div className="rounded-lg border border-white/[0.06] bg-[#08080a] p-4 space-y-2 animate-fadeInUp">
                    <div className="flex items-center justify-between text-xs border-b border-white/[0.04] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 font-mono">HTTP Status:</span>
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${responseStatus >= 200 && responseStatus < 300
                              ? 'text-emerald-400 bg-emerald-400/10'
                              : 'text-red-400 bg-red-400/10'
                            }`}
                        >
                          {responseStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                        <span>Latency:</span>
                        <span className="text-indigo-300 font-bold">{responseTime} ms</span>
                      </div>
                    </div>

                    <pre className="text-xs font-mono text-zinc-300 p-2 overflow-x-auto leading-relaxed max-h-64">
                      {responseOutput}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── 1. Introduction & Core Concepts ─── */}
          {activeTab === 'introduction' && (
            <div className="space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <h2 className="text-base font-bold text-zinc-100">1. Introduction & Core Architecture</h2>
                <p className="text-zinc-400 mt-1">
                  Zorabase is a modern, developer-first Backend-as-a-Service (BaaS) engineered to eliminate redundant backend infrastructure engineering.
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  Most modern cloud architectures suffer from three fundamental problems:
                </p>
                <ol className="list-decimal list-inside space-y-2 pl-2 text-zinc-400">
                  <li><strong className="text-zinc-200">NoSQL Lock-in:</strong> Systems like Firebase Firestore enforce rigid document structures with no relational joins, resulting in painful client-side aggregation and runaway read costs.</li>
                  <li><strong className="text-zinc-200">Server Bandwidth Bottlenecks:</strong> Uploading user media through traditional Node.js API servers bottlenecks CPU threads and consumes expensive egress bandwidth.</li>
                  <li><strong className="text-zinc-200">AI Coding Agent Friction:</strong> Modern AI coding tools (Cursor, Claude Code, Codex, Windsurf) have no built-in awareness of your backend schema, often hallucinating breaking database migrations.</li>
                </ol>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-3 mt-4">
                  <h3 className="text-sm font-semibold text-zinc-100">The Zorabase Solution</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Zorabase unifies schema-isolated PostgreSQL tables, direct AWS S3 presigned object uploads, zero-latency Change Data Capture (CDC) WebSocket streams, and a native Gemini GenAI analyst into a cohesive platform manageable via a single TypeScript SDK (`@zorabase/sdk`).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── 2. Model Context Protocol (MCP) Server ─── */}
          {activeTab === 'mcp-server' && (
            <div className="space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
                    AI Agent Native Protocol
                  </span>
                </div>
                <h2 className="text-base font-bold text-zinc-100">
                  2. Model Context Protocol (MCP) Server (`@zorabase/mcp`)
                </h2>
                <p className="text-zinc-400 mt-1">
                  Connect Cursor, Claude Desktop, Antigravity, Cline, or any MCP-compatible AI agent to your Zorabase project with native JSON-RPC stdio transport.
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  The <code className="text-sky-300 font-mono">@zorabase/mcp</code> package implements the open Model Context Protocol standard, exposing your Zorabase database, AWS S3 storage presigner, and cluster telemetry directly into LLM tool-calling contexts.
                </p>

                <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.03] p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-sky-300">1-Click Agent Configuration</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Add the following JSON block to your AI coding agent configuration (<code className="text-zinc-200">.cursor/mcp.json</code> or <code className="text-zinc-200">claude_desktop_config.json</code>). No global installation needed — agents execute <code className="text-zinc-200">npx</code> on-demand:
                  </p>

                  <div className="rounded-lg border border-white/[0.08] bg-[#050508] p-4 overflow-x-auto">
                    <pre className="text-xs font-mono text-zinc-200 leading-relaxed">{`{
  "mcpServers": {
    "zorabase": {
      "command": "npx",
      "args": ["-y", "@zorabase/mcp"],
      "env": {
        "ZORABASE_PROJECT_URL": "https://api.zorabase.io/v1/proj_YOUR_PROJECT_ID",
        "ZORABASE_API_KEY": "zb_live_YOUR_API_KEY"
      }
    }
  }
}`}</pre>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-zinc-200">Available MCP Tools ({`9`})</h3>
                  <div className="rounded-xl border border-white/[0.08] bg-[#08080a] overflow-hidden">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400">
                          <th className="py-3 px-4">Tool Name</th>
                          <th className="py-3 px-4">Parameters</th>
                          <th className="py-3 px-4 font-sans">Capability &amp; Use Case</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                        <tr>
                          <td className="py-3 px-4 text-sky-300">list_tables</td>
                          <td className="py-3 px-4 text-zinc-500">none</td>
                          <td className="py-3 px-4 font-sans text-zinc-400">List all tables in the active project schema namespace.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-sky-300">get_table_schema</td>
                          <td className="py-3 px-4 text-zinc-400">table_name</td>
                          <td className="py-3 px-4 font-sans text-zinc-400">Inspect column definitions, types, and GIN indexes.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-sky-300">query_data</td>
                          <td className="py-3 px-4 text-zinc-400">table_name, columns, filters, limit, order_by</td>
                          <td className="py-3 px-4 font-sans text-zinc-400">Execute structured queries with equality filters and sorting.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-sky-300">insert_record</td>
                          <td className="py-3 px-4 text-zinc-400">table_name, record</td>
                          <td className="py-3 px-4 font-sans text-zinc-400">Insert new records into any schema table.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-sky-300">update_record</td>
                          <td className="py-3 px-4 text-zinc-400">table_name, record, match</td>
                          <td className="py-3 px-4 font-sans text-zinc-400">Update matching records safely using equality filters.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-sky-300">delete_record</td>
                          <td className="py-3 px-4 text-zinc-400">table_name, match</td>
                          <td className="py-3 px-4 font-sans text-zinc-400">Delete records matching specified criteria.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-sky-300">get_storage_upload_url</td>
                          <td className="py-3 px-4 text-zinc-400">bucket, file_path, content_type</td>
                          <td className="py-3 px-4 font-sans text-zinc-400">Generate direct AWS S3 presigned upload URL (0 MB server load).</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-sky-300">get_storage_download_url</td>
                          <td className="py-3 px-4 text-zinc-400">bucket, file_path, expires_in</td>
                          <td className="py-3 px-4 font-sans text-zinc-400">Generate time-limited signed S3 download URL.</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-sky-300">get_project_health</td>
                          <td className="py-3 px-4 text-zinc-500">none</td>
                          <td className="py-3 px-4 font-sans text-zinc-400">Check PostgreSQL connection, WAL replication status, and memory.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 flex items-start gap-3">
                  <span className="text-amber-400 text-sm shrink-0">🛡️</span>
                  <div className="text-xs text-zinc-400 space-y-1">
                    <p className="font-semibold text-zinc-300">Built-in DDL Guardrails</p>
                    <p>
                      The MCP server enforces runtime guardrails: <code className="text-zinc-200">DROP TABLE</code>, <code className="text-zinc-200">TRUNCATE</code>, and <code className="text-zinc-200">ALTER TABLE</code> commands are strictly blocked to ensure AI coding agents cannot corrupt production databases.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── 3. AI Coding Agent Guardrails (Critical Problem) ─── */}
          {activeTab === 'ai-guardrails' && (
            <div className="space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    Critical BaaS Problem Solved
                  </span>
                </div>
                <h2 className="text-base font-bold text-zinc-100">
                  2. AI Coding Agent Schema Drift & Destructive Migration Guardrails
                </h2>
                <p className="text-zinc-400 mt-1">
                  How Zorabase prevents autonomous AI agents (Cursor, Claude Code, Copilot, Windsurf) from corrupting production databases through hallucinated migrations.
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  As autonomous AI coding agents generate full-stack code, they frequently attempt to execute destructive DDL commands (`DROP TABLE`, `ALTER TABLE`) or introduce redundant schema migrations because they lack runtime database awareness.
                </p>

                <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/[0.06] to-transparent p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-indigo-300">Zorabase's Three-Tier Guardrail Pipeline</h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                      <div>
                        <strong className="text-zinc-100 block">Pre-Flight Prompt Introspection:</strong>
                        <p className="text-zinc-400 mt-0.5">Every AI integration prompt generated in the dashboard provides the LLM with strict guardrails: inspect existing schemas before writing code, reuse existing tables, and never hardcode server secrets into frontend bundles.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                      <div>
                        <strong className="text-zinc-100 block">Public Key DDL Lockdown:</strong>
                        <p className="text-zinc-400 mt-0.5">Public keys (`pk_live_...`) are restricted from executing structural schema mutations. Destructive operations require server keys (`sk_live_...`) or dashboard owner authorization.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                      <div>
                        <strong className="text-zinc-100 block">Zero-Downtime JSONB Record Layer:</strong>
                        <p className="text-zinc-400 mt-0.5">Dynamic table columns are indexed inside PostgreSQL JSONB documents, preventing table locks and downtime during high-concurrency writes.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── 3. Database & Query Engine ─── */}
          {activeTab === 'database-engine' && (
            <div className="space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <h2 className="text-base font-bold text-zinc-100">3. Database Architecture & Query Engine</h2>
                <p className="text-zinc-400 mt-1">
                  Relational data persistence with PostgreSQL Row-Level Security (RLS) and parameterized query execution.
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  Every Zorabase project is assigned an isolated workspace in PostgreSQL (`platform.projects`). Dynamic project tables (`platform.database_tables`, `platform.database_columns`) enforce strict data types (`text`, `integer`, `numeric`, `boolean`, `jsonb`, `timestamptz`, `uuid`).
                </p>

                <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-5 space-y-3">
                  <span className="text-xs font-mono text-zinc-400">TypeScript Query Builder Example</span>
                  <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                    {`const { data: activeUsers, error } = await zorabase
  .from('users')
  .select('id, name, email, plan')
  .eq('status', 'active')
  .gt('credits', 10)
  .order('created_at', { ascending: false })
  .limit(50)`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ─── 4. Filter Operators Reference ─── */}
          {activeTab === 'filter-matrix' && (
            <div className="space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <h2 className="text-base font-bold text-zinc-100">4. Filter Operators Reference Matrix</h2>
                <p className="text-zinc-400 mt-1">
                  Complete mapping of URL query parameters and SDK query builder methods.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02] text-zinc-400 font-medium">
                      <th className="py-3 px-4">Operator</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">REST Query URL</th>
                      <th className="py-3 px-4">SDK Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-zinc-300 font-mono text-[11px]">
                    <tr>
                      <td className="py-3 px-4 font-bold text-indigo-400">eq</td>
                      <td className="py-3 px-4 font-sans text-zinc-400">Exact equality</td>
                      <td className="py-3 px-4">?status=eq.active</td>
                      <td className="py-3 px-4">.eq('status', 'active')</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-indigo-400">neq</td>
                      <td className="py-3 px-4 font-sans text-zinc-400">Not equal</td>
                      <td className="py-3 px-4">?status=neq.deleted</td>
                      <td className="py-3 px-4">.neq('status', 'deleted')</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-indigo-400">gt / gte</td>
                      <td className="py-3 px-4 font-sans text-zinc-400">Greater than (or equal)</td>
                      <td className="py-3 px-4">?age=gt.18</td>
                      <td className="py-3 px-4">.gt('age', 18)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-indigo-400">lt / lte</td>
                      <td className="py-3 px-4 font-sans text-zinc-400">Less than (or equal)</td>
                      <td className="py-3 px-4">?price=lte.100</td>
                      <td className="py-3 px-4">.lte('price', 100)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-indigo-400">order</td>
                      <td className="py-3 px-4 font-sans text-zinc-400">Sort by column</td>
                      <td className="py-3 px-4">?order=created_at.desc</td>
                      <td className="py-3 px-4">.order('created_at', &#123; ascending: false &#125;)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-indigo-400">limit / offset</td>
                      <td className="py-3 px-4 font-sans text-zinc-400">Pagination bounds</td>
                      <td className="py-3 px-4">?limit=25&offset=50</td>
                      <td className="py-3 px-4">.limit(25).offset(50)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── 5. S3 Presigned Storage ─── */}
          {activeTab === 'storage-architecture' && (
            <div className="space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <h2 className="text-base font-bold text-zinc-100">5. AWS S3 Direct Presigned Storage Architecture</h2>
                <p className="text-zinc-400 mt-1">
                  Eliminating API bandwidth and CPU bottlenecks by streaming uploads directly to Amazon S3.
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  In traditional backend architectures, uploading a 50MB video passes bytes through the Node.js server to S3. This consumes 100MB of network transfer (50MB in, 50MB out) and blocks CPU event loops.
                </p>
                <p>
                  Zorabase utilizes **AWS Signature v4 Presigned URLs**:
                </p>

                <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-5 space-y-3">
                  <span className="text-xs font-mono text-zinc-400">Presigned Upload Flow</span>
                  <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                    {`1. Client calls POST /storage/upload-url with { bucket, filename, contentType }
2. Zorabase computes HMAC-SHA256 Sig v4 URL valid for 900 seconds (< 2ms compute)
3. Client issues direct HTTP PUT stream to S3 bucket (eu-north-1)
4. Client notifies Zorabase to record file metadata in PostgreSQL`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ─── 6. Realtime CDC & WebSockets ─── */}
          {activeTab === 'realtime-cdc' && (
            <div className="space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <h2 className="text-base font-bold text-zinc-100">6. Realtime Change Data Capture (CDC) & WebSockets</h2>
                <p className="text-zinc-400 mt-1">
                  Sub-15 millisecond live event streaming powered by PostgreSQL Write-Ahead Log (WAL) replication.
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  Rather than polling or maintaining expensive database triggers, Zorabase attaches directly to the PostgreSQL `supabase_realtime` logical replication publication with `REPLICA IDENTITY FULL`.
                </p>
                <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-5 space-y-3">
                  <span className="text-xs font-mono text-zinc-400">SDK Realtime Subscription</span>
                  <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                    {`const channel = zorabase
  .channel('messages')
  .on('INSERT', (payload) => console.log('New message:', payload.new))
  .on('UPDATE', (payload) => console.log('Message updated:', payload.new))
  .on('DELETE', (payload) => console.log('Message deleted:', payload.old))
  .subscribe()

// Clean up on component unmount
channel.unsubscribe()`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ─── 7. TypeScript SDK Reference ─── */}
          {activeTab === 'sdk-reference' && (
            <div className="space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <h2 className="text-base font-bold text-zinc-100">7. Official TypeScript SDK Reference (`@zorabase/sdk`)</h2>
                <p className="text-zinc-400 mt-1">
                  Compiled into dual ESM and CommonJS modules with zero external runtime dependencies.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-500">Installation</span>
                  <pre className="text-xs font-mono text-zinc-200 bg-[#08080a] p-3 rounded border border-white/[0.04]">
                    npm install @zorabase/sdk
                  </pre>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-500">Client Initialization</span>
                  <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                    {`import { createClient } from '@zorabase/sdk'

export const db = createClient({
  url: 'https://api.zorabase.io/v1/PROJECT_ID',
  apiKey: process.env.NEXT_PUBLIC_ZORABASE_PUBLIC_KEY!,
})`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ─── 8. REST API & Error Codes ─── */}
          {activeTab === 'rest-api-spec' && (
            <div className="space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <h2 className="text-base font-bold text-zinc-100">8. REST API Endpoints & Standard Error Codes</h2>
                <p className="text-zinc-400 mt-1">
                  HTTP specifications for raw cURL, Python, and Go integrations.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-4 space-y-2">
                  <span className="text-xs font-mono text-zinc-400">Standard JSON Response Envelope</span>
                  <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
                    {`// Success Response (HTTP 200 / 201)
{
  "data": [ { "id": "...", "name": "..." } ],
  "error": null
}

// Error Response (HTTP 4xx / 5xx)
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid apikey header"
  }
}`}
                  </pre>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02] text-zinc-400 font-medium">
                        <th className="py-3 px-4">HTTP Status</th>
                        <th className="py-3 px-4">Error Code</th>
                        <th className="py-3 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] text-zinc-300 font-mono text-[11px]">
                      <tr>
                        <td className="py-3 px-4 text-emerald-400 font-bold">200 / 201</td>
                        <td className="py-3 px-4 font-sans text-zinc-400">-</td>
                        <td className="py-3 px-4 font-sans text-zinc-400">Request completed successfully</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-amber-400 font-bold">400</td>
                        <td className="py-3 px-4 text-amber-300">BAD_REQUEST</td>
                        <td className="py-3 px-4 font-sans text-zinc-400">Malformed JSON body or missing query params</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-red-400 font-bold">401</td>
                        <td className="py-3 px-4 text-red-300">UNAUTHORIZED</td>
                        <td className="py-3 px-4 font-sans text-zinc-400">Missing or inactive API key</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-red-400 font-bold">403</td>
                        <td className="py-3 px-4 text-red-300">FORBIDDEN</td>
                        <td className="py-3 px-4 font-sans text-zinc-400">Row-Level Security violation or DDL lock</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-red-400 font-bold">500</td>
                        <td className="py-3 px-4 text-red-300">INTERNAL_ERROR</td>
                        <td className="py-3 px-4 font-sans text-zinc-400">Database or S3 connection exception</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── 9. Security, CORS & Rate Limits ─── */}
          {activeTab === 'security-cors' && (
            <div className="space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <h2 className="text-base font-bold text-zinc-100">9. Security, CORS Policies & Rate Limiting</h2>
                <p className="text-zinc-400 mt-1">
                  Defense-in-depth security model protecting database clusters and client credentials.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] p-4 space-y-2">
                    <span className="text-xs font-semibold text-emerald-400">CORS Preflight Policy</span>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      All endpoints support HTTP `OPTIONS` preflight checks with configurable `Access-Control-Allow-Origin` and `Access-Control-Allow-Headers: Content-Type, Authorization, apikey`.
                    </p>
                  </div>

                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.02] p-4 space-y-2">
                    <span className="text-xs font-semibold text-indigo-400">Token Bucket Rate Limiting</span>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Enforces a default limit of 120 requests per minute per IP address, configurable up to 10,000 RPM in Platform Settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
