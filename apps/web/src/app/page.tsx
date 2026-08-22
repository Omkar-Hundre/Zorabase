'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Data ─────────────────────────────────────────────────────────────────────

const ecosystem = [
  'Next.js 16', 'PostgreSQL 16', 'AWS S3 Stockholm', 'Google Gemini 2.5 Flash',
  'Cursor AI & Claude', 'React Native', 'TypeScript', 'PgBouncer Pooler',
  'Cloudflare Edge', 'Render Cloud', 'Supabase Auth', 'WebSocket CDC',
]

const metrics = [
  { value: '< 15ms', label: 'CDC Broadcast Latency', color: 'text-sky-400' },
  { value: '5,000+', label: 'Queries per Second', color: 'text-emerald-400' },
  { value: '0 MB', label: 'Server Upload Bandwidth', color: 'text-blue-400' },
  { value: '10,000+', label: 'WebSockets per Node', color: 'text-violet-400' },
]

const pillars = [
  {
    index: '01',
    category: 'Database Engine',
    title: 'Schema-isolated PostgreSQL with zero DDL locks',
    body: 'Each project runs inside its own PostgreSQL schema. Dynamic columns are stored as indexed JSONB with GIN indexes — no migration locks, no downtime, even under heavy write loads.',
  },
  {
    index: '02',
    category: 'Object Storage',
    title: 'Direct AWS S3 uploads — 0 MB server load',
    body: 'Zorabase generates an HMAC-SHA256 AWS Signature v4 presigned URL in under 2ms. Your client streams the binary directly to S3 in Stockholm (eu-north-1) without touching the web server.',
  },
  {
    index: '03',
    category: 'Realtime CDC',
    title: 'Sub-15ms WAL logical replication to WebSockets',
    body: 'We attach directly to the PostgreSQL Write-Ahead Log replication slot. INSERT, UPDATE, and DELETE events are decoded and dispatched to connected WebSocket clients in under 15ms — no polling.',
  },
  {
    index: '04',
    category: 'AI Infrastructure',
    title: 'AI agent schema guardrails and natural language queries',
    body: 'Cursor and Claude Code are blocked from running destructive DDL via public keys. Pre-flight schema introspection lets AI agents query and mutate data safely, without hallucinating column names.',
  },
]

const codeExamples: Record<string, { label: string; file: string; code: string }> = {
  database: {
    label: 'Database',
    file: 'query.ts',
    code: `import { createClient } from '@zorabase/sdk'

const db = createClient({
  url: 'https://api.zorabase.io/v1/proj_9f8a',
  apiKey: process.env.NEXT_PUBLIC_ZB_KEY!,
})

const { data } = await db
  .from('users')
  .select('id, name, email, plan')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(50)`,
  },
  storage: {
    label: 'Storage',
    file: 'upload.ts',
    code: `// Direct browser → S3 streaming (0 MB server bandwidth)
const file = input.files[0]

const { data: ref } = await db.storage
  .from('documents')
  .upload(\`\${userId}/\${file.name}\`, file, {
    contentType: file.type,
  })

// SigV4 time-limited signed download URL
const { data: url } = await db.storage
  .from('documents')
  .createSignedUrl(ref.key, 3600)`,
  },
  realtime: {
    label: 'Realtime',
    file: 'stream.ts',
    code: `// PostgreSQL WAL stream → WebSocket in < 15ms
const channel = db
  .channel('orders')
  .on('INSERT', ({ new: row }) => {
    console.log('New order:', row.id)
  })
  .on('UPDATE', ({ new: row }) => {
    console.log('Updated:', row.status)
  })
  .subscribe()`,
  },
  ai: {
    label: 'Gemini AI',
    file: 'analyst.ts',
    code: `// Natural language query with schema introspection
const analysis = await db.ai.query({
  table: 'orders',
  prompt: 'Revenue from active subscriptions this week?',
  pinAsCard: true,
})

// Pins a live widget to your project dashboard`,
  },
}

const faqs = [
  {
    q: 'How does Zorabase differ from Firebase or Supabase?',
    a: 'Firebase locks you into NoSQL, which breaks at relational scale. Supabase gives raw PostgreSQL but needs manual S3 wiring and no AI agent integration. Zorabase delivers schema isolation, direct S3 presigning, sub-15ms CDC, and AI-agent-ready prompts — all in one SDK.',
  },
  {
    q: 'Why use presigned S3 URLs instead of API uploads?',
    a: 'Streaming a 100MB file through a Node.js API costs 200MB of network transit and blocks a worker thread. Presigned URLs let your client stream directly to S3 using AWS HMAC-SHA256 auth — generated in < 2ms with zero server memory.',
  },
  {
    q: 'How does CDC replication actually work?',
    a: 'Zorabase attaches to a PostgreSQL logical replication slot. Every committed transaction is decoded from the Write-Ahead Log and broadcast as a typed JSON payload to all subscribed WebSocket clients in under 15ms.',
  },
  {
    q: 'Is it safe to use with Cursor or Claude Code?',
    a: 'Yes. Public API keys block all DDL (DROP, ALTER, CREATE TABLE). AI agents are given a pre-flight schema introspection prompt so they see real column names and types — eliminating hallucinated migrations.',
  },
]

// ─── Icons ────────────────────────────────────────────────────────────────────
const Arrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-400">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('database')
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const copy = (text: string, which: 'install' | 'code') => {
    navigator.clipboard.writeText(text)
    if (which === 'install') { setCopied(true); setTimeout(() => setCopied(false), 2000) }
    else { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000) }
  }

  const marqueeItems = [...ecosystem, ...ecosystem]

  return (
    <div className="min-h-screen bg-[#030303] text-[#f8f9fa] antialiased overflow-x-hidden" style={{ fontFamily: 'var(--font-sans)' }}>

      {/* ═══ GLOBAL RADIAL AMBIENT GLOW ═══ */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(32,54,101,0.35) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 90% 50%, rgba(32,54,101,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 10% 80%, rgba(32,54,101,0.10) 0%, transparent 55%)
          `,
        }}
      />

      {/* ─── 1. NAVIGATION ─── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#030303]/80 backdrop-blur-xl">
        <div className="w-full px-6 md:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 group">
            <span className="text-[17px] font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
              Zorabase
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[12px] font-medium text-[#a1a1aa] absolute left-1/2 -translate-x-1/2">
            {['Architecture', 'Benchmarks', 'SDK', 'FAQ'].map((label) => (
              <a key={label} href={`#${label.toLowerCase()}`} className="hover:text-white transition-colors">
                {label}
              </a>
            ))}
            <Link href="/dashboard/docs" className="hover:text-white transition-colors">
              Docs
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[12px] font-medium text-[#a1a1aa] hover:text-white transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-[12px] font-semibold text-white bg-[#203665] hover:bg-[#2a4580] px-4 py-2 rounded-lg transition-all shadow-[0_0_20px_rgba(32,54,101,0.5)] border border-sky-400/30 flex items-center gap-1.5"
            >
              Get Started <Arrow />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 2. EXPANDED SAAS HERO SECTION ─── */}
      <section className="relative w-full px-6 md:px-12 pt-16 md:pt-24 pb-20 md:pb-28 overflow-hidden z-10">
        {/* HERO IMAGE BACKGROUND - High visibility & vivid atmospheric blend */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/hero.webp')`,
              opacity: 0.75,
              filter: 'brightness(1.3) contrast(1.15) saturate(1.1)',
            }}
          />
          {/* Smooth bottom & edge blending only, keeping the center forest canopy crystal clear */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/25 to-[#030303]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030303]/40 via-transparent to-[#030303]/40" />
          {/* Subtle radial center glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#203665]/25 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">

          {/* SaaS Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-[-0.04em] drop-shadow-sm">
              The Cloud Backend Built for<br />
              <span className="bg-gradient-to-r from-white via-sky-200 to-[#7d9bdc] bg-clip-text text-transparent">
                High-Speed AI &amp; Fullstack Apps
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow">
              Ship in seconds with schema-isolated PostgreSQL, direct AWS S3 uploads without server transit, sub-15ms CDC live streams, and AI guardrails.
            </p>
          </div>

          {/* SaaS Action Buttons & CLI bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="h-12 px-7 rounded-xl bg-[#203665] hover:bg-[#2a4580] text-[13px] font-semibold text-white transition-all shadow-[0_0_30px_rgba(32,54,101,0.6)] border border-sky-400/40 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.99]"
            >
              Start Building For Free
              <Arrow />
            </Link>

            <button
              onClick={() => copy('pnpm add @zorabase/sdk', 'install')}
              className="group flex items-center gap-2 h-12 px-4 rounded-xl bg-[#09090b]/90 hover:bg-[#121216] border border-white/[0.12] hover:border-sky-400/50 transition-all cursor-pointer text-[12px] text-slate-300 backdrop-blur-md shadow-lg"
            >
              <span className="font-mono text-sky-400">$</span>
              <span className="font-mono font-medium text-slate-200">pnpm add @zorabase/sdk</span>
              <span className="ml-3 font-mono text-[11px] text-slate-400 group-hover:text-white px-2 py-0.5 rounded bg-white/[0.06] transition-colors">
                {copied ? '✓ copied' : 'copy'}
              </span>
            </button>
          </div>

          {/* SaaS Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 pt-2 text-[12px] text-slate-400 font-medium">
            <div className="flex items-center gap-1.5"><Check /> Zero Config PostgreSQL</div>
            <div className="flex items-center gap-1.5"><Check /> 0MB Server S3 Uploads</div>
            <div className="flex items-center gap-1.5"><Check /> 15ms CDC Replication</div>
            <div className="flex items-center gap-1.5"><Check /> MIT Licensed SDK</div>
          </div>

          {/* SaaS Product Interactive Preview Card */}
          <div className="pt-6">
            <div className="relative rounded-2xl border border-white/[0.12] bg-[#07070b]/90 backdrop-blur-2xl p-2 sm:p-3 shadow-[0_20px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(32,54,101,0.25)] text-left">
              {/* Window Bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="ml-3 text-[11px] font-mono text-slate-400">zorabase-console // live-cluster [eu-north-1]</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CDC Connected (11ms)
                </div>
              </div>

              {/* Console Body: 3-column SaaS dashboard mockup */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-2">
                {/* Realtime Stream Panel */}
                <div className="md:col-span-5 rounded-xl bg-[#09090e] border border-white/[0.06] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span>⚡ Realtime CDC Stream</span>
                    <span className="font-mono text-[10px] text-sky-400">WAL Slot: active</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                      <span>INSERT orders #89201</span>
                      <span className="text-[9px] text-emerald-400/70">8ms ago</span>
                    </div>
                    <div className="p-2 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300 flex items-center justify-between">
                      <span>UPDATE users uid_44</span>
                      <span className="text-[9px] text-sky-400/70">14ms ago</span>
                    </div>
                    <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04] text-slate-400 flex items-center justify-between">
                      <span>PRESIGN S3 /docs/inv.pdf</span>
                      <span className="text-[9px] text-slate-500">22ms ago</span>
                    </div>
                  </div>
                </div>

                {/* Direct SDK Code Panel */}
                <div className="md:col-span-7 rounded-xl bg-[#050508] border border-white/[0.06] p-3.5 flex flex-col justify-between font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 border-b border-white/[0.04] pb-2 mb-2">
                    <span className="text-sky-300">app/api/stream.ts</span>
                    <span className="text-[10px] text-slate-500">TypeScript 5.4</span>
                  </div>
                  <pre className="text-slate-300 leading-relaxed overflow-x-auto text-[11px]">
                    <code>{`const db = createClient({ url, apiKey })\n\n// Sub-15ms live Postgres CDC stream\ndb.channel('orders')\n  .on('INSERT', ({ new: row }) => dispatch(row))\n  .subscribe()`}</code>
                  </pre>
                  <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-500">
                    <span>AWS Stockholm (eu-north-1)</span>
                    <span className="text-sky-400">Zero Server Memory Load</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. TECH STACK MARQUEE ─── */}
      <div className="relative overflow-hidden border-y border-white/[0.06] bg-[#06060a] py-3 z-10">
        <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-[#030303] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-[#030303] to-transparent z-10 pointer-events-none" />
        <div className="marquee-track">
          {marqueeItems.map((tech, i) => (
            <span key={i} className="flex items-center gap-2 mx-3 px-3.5 py-1.5 rounded-full border border-white/[0.06] text-[11px] font-mono text-slate-400 whitespace-nowrap bg-white/[0.02]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400/80" />
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* ─── 4. METRICS BANNER ─── */}
      <section id="benchmarks" className="relative w-full px-6 md:px-12 py-16 z-10">
        <div className="max-w-5xl mx-auto rounded-2xl bg-[#203665] overflow-hidden shadow-[0_0_60px_rgba(32,54,101,0.35)] border border-sky-400/20 px-8 md:px-14 py-10 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
          {metrics.map((m) => (
            <div key={m.label} className="border-l-2 border-sky-400/60 pl-5 space-y-1">
              <div className="text-3xl md:text-4xl font-extralight tracking-tight text-white">{m.value}</div>
              <div className="text-[11px] text-sky-200/90 uppercase tracking-widest font-medium leading-snug">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. ARCHITECTURE ─── */}
      <section id="architecture" className="relative w-full px-6 md:px-12 py-14 md:py-20 border-t border-white/[0.06] z-10">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="max-w-xl space-y-2">
            <span className="block text-[11px] font-semibold text-[#6e86c4] uppercase tracking-widest">
              Core Architecture
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight tracking-[-0.03em]">
              Four high-performance subsystems,<br />unified in one SDK.
            </h2>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {pillars.map((p) => (
              <div key={p.index} className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 group">
                <div className="md:col-span-5 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-sky-400">{p.index}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded">
                      {p.category}
                    </span>
                  </div>
                  <h3 className="text-[16px] font-semibold text-white group-hover:text-sky-300 transition-colors leading-snug">
                    {p.title}
                  </h3>
                </div>
                <div className="md:col-span-7">
                  <p className="text-[13px] text-slate-400 leading-relaxed font-light">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. SDK CODE STUDIO ─── */}
      <section id="sdk" className="relative w-full px-6 md:px-12 py-14 md:py-20 border-t border-white/[0.06] z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-[#6e86c4]">SDK Studio</span>
              <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-[-0.03em]">
                <code className="font-mono text-sky-300">@zorabase/sdk</code>
              </h2>
              <p className="text-[12px] text-slate-400 font-light">Zero external dependencies · ESM + CJS dual build · Strict TypeScript types.</p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#09090b] border border-white/[0.08] rounded-xl">
              {Object.entries(codeExamples).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all ${activeTab === key
                    ? 'bg-[#203665] text-white shadow-sm border border-sky-400/30'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#07070b] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 bg-[#050508] border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2.5 text-[12px] text-slate-400 font-mono">{codeExamples[activeTab].file}</span>
              </div>
              <button
                onClick={() => copy(codeExamples[activeTab].code, 'code')}
                className="text-[11px] font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
              >
                {copiedCode ? '✓ copied' : 'copy'}
              </button>
            </div>
            <pre className="px-6 py-5 text-[12px] font-mono text-[#c9d1d9] leading-relaxed overflow-x-auto">
              <code>{codeExamples[activeTab].code}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ─── 7. MCP SERVER ─── */}
      <section id="mcp" className="relative w-full px-6 md:px-12 py-14 md:py-20 border-t border-white/[0.06] z-10">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-[#6e86c4]">AI Agent Integration</span>
              <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-[-0.03em] leading-tight">
                Connect any AI agent to your database in seconds.
              </h2>
              <p className="text-[13px] text-slate-400 leading-relaxed font-light">
                Zorabase ships a native <strong className="text-white font-medium">Model Context Protocol (MCP) server</strong> — <code className="text-sky-300 font-mono">@zorabase/mcp</code>. Add three lines of JSON to Cursor, Claude Desktop, or Antigravity and your AI agent can instantly query tables, insert records, generate S3 URLs, and check system health.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Cursor', 'Claude Desktop', 'Antigravity', 'Cline', 'Windsurf'].map((agent) => (
                  <span key={agent} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.04] border border-white/[0.07] text-slate-300">
                    {agent}
                  </span>
                ))}
              </div>
            </div>

            {/* Config snippet */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#07070b] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#050508] border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                  <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
                  <span className="w-2 h-2 rounded-full bg-[#28c840]" />
                  <span className="ml-2 text-[11px] font-mono text-slate-500">.cursor/mcp.json</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  ● Live
                </span>
              </div>
              <pre className="px-5 py-4 text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto">{`{
  "mcpServers": {
    "zorabase": {
      "command": "npx",
      "args": ["-y", "@zorabase/mcp"],
      "env": {
        "ZORABASE_PROJECT_URL": "https://api.zorabase.io/v1/proj_xxx",
        "ZORABASE_API_KEY": "zb_live_your_key"
      }
    }
  }
}`}</pre>
            </div>
          </div>

          {/* MCP tools grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: '🗂️', name: 'list_tables',              desc: 'Discover schema structure' },
              { icon: '🔍', name: 'query_data',               desc: 'Fetch rows with filters' },
              { icon: '✏️', name: 'insert_record',            desc: 'Write data to any table' },
              { icon: '☁️', name: 'get_storage_upload_url',   desc: 'Direct S3 presigned upload' },
              { icon: '⚡', name: 'get_project_health',       desc: 'PostgreSQL & WAL status' },
              { icon: '🛡️', name: 'DDL Guardrail',            desc: 'DROP / TRUNCATE blocked' },
            ].map((tool) => (
              <div key={tool.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{tool.icon}</span>
                  <code className="text-[11px] font-mono text-sky-300">{tool.name}</code>
                </div>
                <p className="text-[11px] text-slate-500">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. FAQ ─── */}
      <section id="faq" className="relative w-full px-6 md:px-12 py-14 md:py-20 border-t border-white/[0.06] z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-1.5">
            <span className="block text-[11px] font-semibold uppercase tracking-widest text-[#6e86c4]">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-[-0.03em]">Frequently asked questions</h2>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {faqs.map((item, i) => {
              const open = openFaq === i
              return (
                <div key={i} className="py-4">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between text-left gap-4"
                  >
                    <span className="text-[14px] font-medium text-white">{item.q}</span>
                    <span className="text-slate-400 font-mono text-base shrink-0">{open ? '−' : '+'}</span>
                  </button>
                  {open && (
                    <p className="mt-3 text-[13px] text-slate-400 leading-relaxed font-light">{item.a}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── 8. CTA ─── */}
      <section className="relative w-full px-6 md:px-12 py-14 md:py-20 border-t border-white/[0.06] z-10">
        <div className="max-w-5xl mx-auto rounded-2xl border border-[#203665]/40 bg-[#09090b] px-10 md:px-14 py-12 flex flex-col md:flex-row md:items-center gap-8 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#203665]/[0.25] rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2.5 flex-1 relative z-10">
            <span className="block text-[11px] font-semibold uppercase tracking-widest text-sky-400">Instant Provisioning</span>
            <h2 className="text-2xl md:text-3xl font-semibold text-white leading-tight tracking-[-0.03em]">
              Ready to ship without backend friction?
            </h2>
            <p className="text-[13px] text-slate-400 font-light leading-relaxed max-w-sm">
              Create your project in 10 seconds, get your schema isolation and live CDC stream instantly.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0 relative z-10">
            <Link
              href="/register"
              className="h-11 px-8 rounded-xl bg-[#203665] hover:bg-[#2a4580] text-[12px] font-semibold text-white transition-all shadow-[0_0_24px_rgba(32,54,101,0.5)] border border-sky-400/30 flex items-center justify-center gap-2"
            >
              Get Started Free <Arrow />
            </Link>
            <Link
              href="/dashboard/docs"
              className="h-11 px-8 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] text-[12px] font-medium text-slate-300 hover:text-white transition-colors flex items-center justify-center"
            >
              Read Architecture Docs
            </Link>
            <p className="text-[11px] text-slate-500 font-mono text-center">No credit card required · Open Source SDK</p>
          </div>
        </div>
      </section>

      {/* ─── WATERMARK ─── */}
      <div className="relative overflow-hidden py-4 z-10 flex justify-center" aria-hidden>
        <span className="watermark">ZORABASE</span>
      </div>
    </div>
  )
}
