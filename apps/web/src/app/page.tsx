'use client'

import { useState } from 'react'
import Link from 'next/link'

const codeSnippets: Record<string, { title: string; filename: string; code: string }> = {
  database: {
    title: 'Relational Database',
    filename: 'query.ts',
    code: `import { createClient } from '@zorabase/sdk'

export const db = createClient({
  url: 'https://api.zorabase.io/v1/proj_9f8a',
  apiKey: process.env.NEXT_PUBLIC_ZORABASE_KEY!,
})

// Type-safe query with parameterized filters
const { data: users, error } = await db
  .from('users')
  .select('id, name, email, plan')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(25)`,
  },
  storage: {
    title: 'Direct S3 Storage',
    filename: 'upload.ts',
    code: `// Direct browser upload to AWS S3 (eu-north-1)
// Bypasses web server bandwidth entirely
const file = event.target.files[0]

const { data: ref, error } = await db.storage
  .from('documents')
  .upload(\`contracts/\${docId}/\${file.name}\`, file, {
    contentType: file.type,
  })

// Generate time-limited signed download link
const { data: signed } = await db.storage
  .from('documents')
  .createSignedUrl(ref.key, 3600)`,
  },
  realtime: {
    title: 'Realtime CDC Stream',
    filename: 'stream.ts',
    code: `// Sub-15ms Change Data Capture (CDC) replication
const channel = db
  .channel('orders')
  .on('INSERT', (payload) => {
    console.log('New order received:', payload.new)
  })
  .on('UPDATE', (payload) => {
    console.log('Order status changed:', payload.new)
  })
  .subscribe()`,
  },
  ai: {
    title: 'Gemini GenAI Assistant',
    filename: 'analyst.ts',
    code: `// Natural language querying over relational records
// Generates persistent live widgets & insight metrics
const analysis = await db.ai.query({
  table: 'orders',
  prompt: 'Calculate total revenue from active subscriptions this week',
  pinAsCard: true, // Automatically pins to project dashboard
})`,
  },
}

const architecturalPillars = [
  {
    title: 'Schema-Isolated Relational Data',
    category: 'Database Engine',
    desc: 'Each project operates within an isolated PostgreSQL namespace with typed columns, JSONB flexibility, and GIN indexing.',
    metric: '5,000+ QPS',
  },
  {
    title: 'Direct AWS S3 Presigned Uploads',
    category: 'Object Storage',
    desc: 'Cryptographically signed AWS Signature v4 tokens allow clients to stream binaries directly to S3 with 0 MB server bandwidth load.',
    metric: '0 Bandwidth Cost',
  },
  {
    title: 'Sub-15ms Realtime Change Data Capture',
    category: 'Streaming Engine',
    desc: 'PostgreSQL Write-Ahead Log (WAL) logical decoding broadcasts mutations to connected WebSockets in real time.',
    metric: '< 15ms Latency',
  },
  {
    title: 'AI Coding Agent Guardrails',
    category: 'AI Infrastructure',
    desc: 'Pre-flight schema introspection and public key DDL lockdowns prevent Cursor and Claude Code from generating hallucinated migrations.',
    metric: 'Zero Schema Drift',
  },
]

export default function LandingPage() {
  const [activeCodeTab, setActiveCodeTab] = useState('database')

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Subtle Grid & Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-indigo-500/[0.07] blur-[120px] pointer-events-none" />

      {/* ─── Navigation ─── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070709]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              Z
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-100">Zorabase</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#architecture" className="hover:text-zinc-100 transition-colors">Architecture</a>
            <a href="#benchmarks" className="hover:text-zinc-100 transition-colors">Benchmarks</a>
            <a href="#sdk" className="hover:text-zinc-100 transition-colors">TypeScript SDK</a>
            <Link href="/dashboard/docs" className="hover:text-zinc-100 transition-colors">Documentation</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 space-y-32">
        {/* ─── Hero Section ─── */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/[0.06] text-[11px] font-medium text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>Developer-First Backend-as-a-Service</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.1]">
            The unified backend engine for modern web apps & AI agents
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Schema-isolated PostgreSQL databases, zero-bandwidth AWS S3 presigned storage, sub-15ms Change Data Capture, and native GenAI schema intelligence.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto h-10 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-[0_0_25px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
            >
              <span>Create Project Free</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/dashboard/docs"
              className="w-full sm:w-auto h-10 px-5 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-xs font-medium text-zinc-300 transition-colors flex items-center justify-center"
            >
              Explore API Reference
            </Link>
          </div>
        </section>

        {/* ─── Benchmarks Metrics Bar ─── */}
        <section id="benchmarks" className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">&lt; 15ms</div>
            <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-medium">CDC Broadcast Latency</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">5,000+ QPS</div>
            <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-medium">Query Engine Throughput</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">0 MB</div>
            <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-medium">Server Bandwidth on Uploads</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">10,000+</div>
            <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-medium">Concurrent WebSockets / Node</div>
          </div>
        </section>

        {/* ─── Architecture Pillars ─── */}
        <section id="architecture" className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              Engineered for Production Scale
            </h2>
            <p className="text-xs text-zinc-400">
              A cohesive architecture designed to eliminate boilerplate without compromising on relational integrity or security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {architecturalPillars.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14] p-6 space-y-3 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {p.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    {p.metric}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-100">{p.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Interactive Code & SDK Showcase ─── */}
        <section id="sdk" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
                Official TypeScript SDK (`@zorabase/sdk`)
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Zero external runtime dependencies. Dual ESM and CommonJS bundles with complete type safety.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#0c0c0e] border border-white/[0.08] p-1 rounded-lg">
              {Object.keys(codeSnippets).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveCodeTab(key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                    activeCodeTab === key
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#08080a] border-b border-white/[0.06] text-xs font-mono text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-zinc-400">{codeSnippets[activeCodeTab].filename}</span>
              </div>
              <span className="text-[11px] text-indigo-400">{codeSnippets[activeCodeTab].title}</span>
            </div>

            <pre className="p-5 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
              {codeSnippets[activeCodeTab].code}
            </pre>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/[0.08] via-white/[0.02] to-transparent p-10 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            Start building on Zorabase today
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Provision schema namespaces, generate AI agent integration prompts, and build your next production application in minutes.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-[0_0_25px_rgba(99,102,241,0.4)]"
            >
              <span>Get Started Free</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Zorabase Infrastructure. Engineered for modern developers and AI agents.</p>
      </footer>
    </div>
  )
}
