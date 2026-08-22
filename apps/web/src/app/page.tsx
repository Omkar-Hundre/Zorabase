'use client'

import { useState } from 'react'
import Link from 'next/link'

const codeSnippets: Record<string, { title: string; filename: string; code: string; summary: string }> = {
  database: {
    title: 'Relational Query Engine',
    filename: 'database.ts',
    summary: 'Schema-isolated PostgreSQL tables with typed columns, JSONB flexibility, and parameterized queries.',
    code: `import { createClient } from '@zorabase/sdk'

export const db = createClient({
  url: 'https://api.zorabase.io/v1/proj_9f8a',
  apiKey: process.env.NEXT_PUBLIC_ZORABASE_KEY!,
})

// Type-safe query with parameterized filters ($1, $2)
const { data: users, error } = await db
  .from('users')
  .select('id, name, email, plan, credits')
  .eq('status', 'active')
  .gt('credits', 0)
  .order('created_at', { ascending: false })
  .limit(25)`,
  },
  storage: {
    title: 'Direct S3 Presigned Uploads',
    filename: 'storage.ts',
    summary: 'Direct browser-to-S3 binary streaming via AWS Signature v4. Bypasses API server bandwidth entirely.',
    code: `// Stream files directly to AWS S3 (eu-north-1)
// Consumes 0 MB of web server bandwidth
const file = event.target.files[0]

const { data: ref, error } = await db.storage
  .from('documents')
  .upload(\`contracts/\${docId}/\${file.name}\`, file, {
    contentType: file.type,
  })

// Generate time-limited AWS SigV4 signed download URL
const { data: signed } = await db.storage
  .from('documents')
  .createSignedUrl(ref.key, 3600)`,
  },
  realtime: {
    title: 'Realtime CDC Replication',
    filename: 'realtime.ts',
    summary: 'Sub-15ms live streaming powered by PostgreSQL Write-Ahead Log (WAL) logical decoding.',
    code: `// Subscribe to live PostgreSQL database mutations
const channel = db
  .channel('orders')
  .on('INSERT', (payload) => {
    console.log('⚡ New order committed to Postgres:', payload.new)
  })
  .on('UPDATE', (payload) => {
    console.log('🔄 Order status updated in real time:', payload.new)
  })
  .subscribe()`,
  },
  ai: {
    title: 'Gemini GenAI Schema Analyst',
    filename: 'analyst.ts',
    summary: 'Natural language querying over relational records with 1-click live pinned dashboard widgets.',
    code: `// Natural language SQL querying with automated schema introspection
const analysis = await db.ai.query({
  table: 'orders',
  prompt: 'Calculate total revenue from active subscriptions this week',
  pinAsCard: true, // Automatically pins live insight widget to dashboard
})`,
  },
}

const trustTechs = [
  'NEXT.JS 16',
  'POSTGRESQL 16',
  'AWS S3',
  'GOOGLE GEMINI 2.5',
  'CURSOR AI',
  'CLAUDE CODE',
  'REACT NATIVE',
  'TYPESCRIPT',
  'PGBOUNCER',
  'CLOUDFLARE EDGE',
  'RENDER CLOUD',
  'TAILWIND CSS',
]

const architecturalPillars = [
  {
    number: '01',
    title: 'Relational Integrity without DDL Locks',
    category: 'DATABASE ENGINE',
    desc: 'Each project operates within a schema-isolated PostgreSQL workspace. Dynamic table columns are indexed inside JSONB documents with GIN indexes, guaranteeing zero downtime and no migration locks during high-traffic writes.',
  },
  {
    number: '02',
    title: 'Direct S3 Presigned Upload Architecture',
    category: 'OBJECT STORAGE',
    desc: 'Traditional API proxies force 200MB of network transit for a 100MB file. Zorabase generates cryptographically signed AWS Signature v4 tokens in under 2ms, allowing clients to stream directly to S3 with 0 MB server bandwidth load.',
  },
  {
    number: '03',
    title: 'Sub-15ms Change Data Capture (CDC)',
    category: 'REALTIME STREAMING',
    desc: 'Rather than running database polling loops, Zorabase attaches directly to the PostgreSQL Write-Ahead Log (WAL) logical replication publication, broadcasting live mutation events across connected WebSockets instantly.',
  },
  {
    number: '04',
    title: 'AI Coding Agent Schema Guardrails',
    category: 'AI INFRASTRUCTURE',
    desc: 'Autonomous coding tools like Cursor and Claude Code often hallucinate columns and break production schemas. Zorabase enforces pre-flight schema introspection prompts and restricts public keys from executing destructive DDL.',
  },
]

const faqItems = [
  {
    q: 'How does Zorabase compare to Firebase or Supabase?',
    a: 'Firebase forces proprietary NoSQL documents that lack relational integrity and become expensive at scale. Supabase provides raw PostgreSQL but requires manual configuration for S3 presigning and AI prompts. Zorabase provides turnkey schema isolation, direct S3 presigned storage (0 server bandwidth), sub-15ms CDC WebSockets, and 1-click prompts tailored for AI coding agents.',
  },
  {
    q: 'Why use Presigned S3 URLs instead of streaming files through the API?',
    a: 'Streaming files through a Node.js web server consumes 200MB of network transit for a 100MB file (100MB in, 100MB out) and blocks worker threads. With AWS Presigned URLs, Zorabase generates an HMAC-SHA256 signature in < 2ms, and the client streams directly to Amazon S3 with zero server memory overhead.',
  },
  {
    q: 'How do you prevent SQL Injection and unauthorized mutations?',
    a: 'The SDK does not accept raw SQL from client apps. It uses a chainable QueryBuilder that transforms operations into parameterized PostgreSQL queries ($1, $2). Public keys (pk_live_...) are strictly restricted from executing DDL statements (DROP TABLE, ALTER TABLE).',
  },
  {
    q: 'Can I connect autonomous AI coding agents like Cursor or Claude Code?',
    a: 'Yes! Zorabase provides a 1-click AI setup prompt that introspects your database schemas, tables, and storage buckets, allowing AI coding tools to integrate queries directly without hallucinations or schema drift.',
  },
]

export default function LandingPage() {
  const [activeCodeTab, setActiveCodeTab] = useState('database')
  const [copiedKeycap, setCopiedKeycap] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  function handleCopyKeycap() {
    navigator.clipboard.writeText('pnpm add @zorabase/sdk')
    setCopiedKeycap(true)
    setTimeout(() => setCopiedKeycap(false), 2000)
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab].code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden font-sans">
      {/* ─── Hero Nature Background with Smooth Dark Vignette Overlay ─── */}
      <div className="absolute top-0 left-0 right-0 h-[680px] sm:h-[820px] overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=2400&auto=format&fit=crop')`,
          }}
        />
        {/* Multi-tier gradient overlay to seamlessly blend into obsidian void #030303 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/40 via-[#030303]/80 to-[#030303]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-[#030303]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/[0.08] blur-[150px]" />
      </div>

      {/* ─── Fixed Minimal Floating Navigation ─── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030303]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
          {/* Brand Logo in Nothing Pixel style */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform font-nothing">
              Z
            </div>
            <span className="font-nothing text-xl font-bold tracking-wider text-white">ZORABASE</span>
          </Link>

          {/* Centered Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400 absolute left-1/2 -translate-x-1/2 pointer-events-auto">
            <a href="#how-it-works" className="hover:text-zinc-100 transition-colors">ARCHITECTURE</a>
            <a href="#benchmarks" className="hover:text-zinc-100 transition-colors">BENCHMARKS</a>
            <a href="#sdk" className="hover:text-zinc-100 transition-colors">SDK</a>
            <a href="#faq" className="hover:text-zinc-100 transition-colors">FAQ</a>
            <Link href="/dashboard/docs" className="hover:text-zinc-100 transition-colors">DOCS</Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] font-nothing tracking-wider"
            >
              GET STARTED →
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-28 space-y-36">
        {/* ─── Hero Section ─── */}
        <section className="text-center max-w-4xl mx-auto space-y-8 pt-8">
          {/* Tactical Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-nothing">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>(01) ZERO-BANDWIDTH S3 · SUB-15MS CDC</span>
          </div>

          {/* Editorial Headline with Nothing Dot-Matrix Style */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white font-nothing tracking-wide leading-[1.1]">
            #1 UNIFIED BACKEND ENGINE<br />
            <span className="text-indigo-400">FOR MODERN APPS &amp; AI AGENTS</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Schema-isolated PostgreSQL tables, direct AWS S3 presigned object uploads, zero-latency CDC WebSocket streams, and native Gemini GenAI intelligence in a single TypeScript SDK.
          </p>

          {/* Tactile 3D Keycap Command Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleCopyKeycap}
              className="group flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#09090b]/90 border border-white/[0.1] hover:border-indigo-500/40 transition-all cursor-pointer shadow-lg backdrop-blur-md"
              title="Click to copy install command"
            >
              <kbd className="tactile-key">pnpm</kbd>
              <kbd className="tactile-key">add</kbd>
              <kbd className="tactile-key text-indigo-300">@zorabase/sdk</kbd>
              <span className="text-[11px] text-zinc-400 group-hover:text-zinc-200 font-mono ml-2">
                {copiedKeycap ? '✓ Copied' : '📋'}
              </span>
            </button>

            <Link
              href="/register"
              className="h-10 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-[0_0_25px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 font-nothing tracking-wider"
            >
              <span>START BUILDING FREE</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ─── Infinite Marquee Ecosystem Carousel ─── */}
        <section className="relative overflow-hidden py-4 border-y border-white/[0.06] bg-[#070709]/60 backdrop-blur-md">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#030303] via-[#030303]/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#030303] via-[#030303]/90 to-transparent z-10 pointer-events-none" />

          <div className="trust-marquee-track flex items-center gap-8">
            {[...trustTechs, ...trustTechs, ...trustTechs].map((tech, idx) => (
              <div
                key={`${tech}-${idx}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-[#09090b] text-xs font-nothing text-zinc-400 whitespace-nowrap tracking-wider"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80" />
                <span>{tech}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Live Benchmarks Metrics Bar in Nothing Pixel Style ─── */}
        <section id="benchmarks" className="rounded-2xl border border-white/[0.08] bg-[#09090b]/80 backdrop-blur-md p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-5xl font-bold text-indigo-400 font-nothing tracking-wider">&lt; 15MS</div>
            <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-mono font-semibold">CDC Broadcast Latency</div>
          </div>
          <div>
            <div className="text-3xl sm:text-5xl font-bold text-emerald-400 font-nothing tracking-wider">5,000+ QPS</div>
            <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-mono font-semibold">Query Engine Capacity</div>
          </div>
          <div>
            <div className="text-3xl sm:text-5xl font-bold text-blue-400 font-nothing tracking-wider">0 MB</div>
            <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-mono font-semibold">Server Bandwidth on Uploads</div>
          </div>
          <div>
            <div className="text-3xl sm:text-5xl font-bold text-purple-400 font-nothing tracking-wider">10,000+</div>
            <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-mono font-semibold">WebSockets / Node</div>
          </div>
        </section>

        {/* ─── Architectural Line-Divided Deep Dive (No Box Slop) ─── */}
        <section id="how-it-works" className="space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-nothing tracking-wide">
              ARCHITECTURAL SUBSYSTEMS
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Four specialized subsystems engineered for maximum developer velocity, zero bandwidth waste, and predictable latencies.
            </p>
          </div>

          <div className="space-y-8 divide-y divide-white/[0.06]">
            {architecturalPillars.map((p) => (
              <div
                key={p.number}
                className="pt-8 first:pt-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start group"
              >
                <div className="lg:col-span-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-nothing text-2xl font-bold text-indigo-400">{p.number}</span>
                    <span className="text-[10px] font-nothing font-semibold uppercase tracking-wider text-zinc-400 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded">
                      {p.category}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-zinc-100 group-hover:text-indigo-200 transition-colors">
                    {p.title}
                  </h3>
                </div>

                <div className="lg:col-span-8">
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Interactive Architecture & Code Studio (`#sdk`) ─── */}
        <section id="sdk" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-nothing tracking-wide">
                OFFICIAL TYPESCRIPT SDK (<code className="text-indigo-400 font-mono text-xl">@zorabase/sdk</code>)
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Zero external dependencies. Dual ESM and CommonJS bundles with full TypeScript declaration maps.
              </p>
            </div>

            {/* Tab Selectors */}
            <div className="flex items-center gap-1 bg-[#09090b] border border-white/[0.08] p-1 rounded-xl">
              {Object.keys(codeSnippets).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveCodeTab(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all uppercase font-nothing tracking-wider ${
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

          {/* Dark Code Terminal Container */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#09090b] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 bg-[#060608] border-b border-white/[0.06] text-xs font-mono text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-zinc-300">{codeSnippets[activeCodeTab].filename}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-indigo-400 font-semibold font-nothing uppercase tracking-wider">{codeSnippets[activeCodeTab].title}</span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-zinc-300 font-mono transition-colors"
                >
                  {copiedCode ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#08080a] border-b border-white/[0.04] text-xs text-zinc-400">
              {codeSnippets[activeCodeTab].summary}
            </div>

            <pre className="p-6 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
              <code>{codeSnippets[activeCodeTab].code}</code>
            </pre>
          </div>
        </section>

        {/* ─── Developer FAQ Accordion (`#faq`) ─── */}
        <section id="faq" className="space-y-10 max-w-3xl mx-auto">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-nothing tracking-wide">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-xs text-zinc-400">
              Straightforward answers to core architectural and operational questions.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={item.q}
                  className="rounded-xl border border-white/[0.08] bg-[#09090b] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between text-xs font-semibold text-zinc-200 hover:text-white"
                  >
                    <span>{item.q}</span>
                    <span className="text-zinc-500 text-base font-nothing">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── Dark Luxury Conversion Section ─── */}
        <section className="rounded-3xl border border-white/[0.08] bg-[#09090b] p-8 sm:p-14 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-600/[0.12] rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider font-nothing">
              <span>(INSTANT PROVISIONING)</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white font-nothing tracking-wide leading-tight">
              READY TO SHIP WITHOUT BACKEND FRICTION?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Create a project in 10 seconds, copy your AI agent setup prompt, and build full-stack applications with PostgreSQL, S3, and WebSockets.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 relative z-10">
            <Link
              href="/register"
              className="w-full sm:w-auto h-11 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-[0_0_20px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 font-nothing tracking-wider"
            >
              <span>GET STARTED FREE</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/dashboard/docs"
              className="w-full sm:w-auto h-11 px-6 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] text-xs font-semibold text-zinc-300 transition-colors flex items-center justify-center font-nothing tracking-wider"
            >
              READ DOCS
            </Link>
          </div>

          <p className="text-[11px] text-zinc-500 pt-2 border-t border-white/[0.06] relative z-10 font-mono">
            No credit card required · Free tier with PostgreSQL, S3 Presigning &amp; Gemini GenAI · MIT License
          </p>
        </section>

        {/* ─── Giant Brand Watermark in Nothing Dot-Matrix Style ─── */}
        <div className="flex justify-center -mb-20 overflow-hidden select-none pointer-events-none">
          <span className="brand-watermark-text font-nothing">ZORABASE</span>
        </div>
      </main>

      {/* ─── Minimalist Footer ─── */}
      <footer className="border-t border-white/[0.08] bg-[#09090b] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-nothing tracking-wider">ALL SYSTEMS OPERATIONAL // V1.0.0</span>
          </div>
          <p>© {new Date().getFullYear()} Zorabase Cloud Infrastructure. Engineered for modern developers &amp; AI agents.</p>
        </div>
      </footer>
    </div>
  )
}
