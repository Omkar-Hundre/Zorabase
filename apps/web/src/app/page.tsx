'use client'

import { useState } from 'react'
import Link from 'next/link'

const codeSnippets: Record<string, { title: string; filename: string; code: string; language: string }> = {
  database: {
    title: 'Relational Query Engine',
    filename: 'query.ts',
    language: 'typescript',
    code: `import { createClient } from '@zorabase/sdk'

export const db = createClient({
  url: 'https://api.zorabase.io/v1/proj_9f8a',
  apiKey: process.env.NEXT_PUBLIC_ZORABASE_KEY!,
})

// Parameterized query with strict column typing
const { data: users, error } = await db
  .from('users')
  .select('id, name, email, plan, credits')
  .eq('status', 'active')
  .gt('credits', 0)
  .order('created_at', { ascending: false })
  .limit(25)`,
  },
  storage: {
    title: 'Direct S3 Presigned Upload',
    filename: 'upload.ts',
    language: 'typescript',
    code: `// Direct browser-to-S3 binary streaming (eu-north-1)
// Bypasses API server CPU & bandwidth completely
const file = event.target.files[0]

const { data: ref, error } = await db.storage
  .from('documents')
  .upload(\`contracts/\${docId}/\${file.name}\`, file, {
    contentType: file.type,
  })

// Generate time-limited AWS SigV4 signed URL
const { data: signed } = await db.storage
  .from('documents')
  .createSignedUrl(ref.key, 3600)`,
  },
  realtime: {
    title: 'Realtime CDC Replication',
    filename: 'stream.ts',
    language: 'typescript',
    code: `// Sub-15ms PostgreSQL Write-Ahead Log (WAL) streaming
const channel = db
  .channel('orders')
  .on('INSERT', (payload) => {
    console.log('⚡ New order received:', payload.new)
  })
  .on('UPDATE', (payload) => {
    console.log('🔄 Order status updated:', payload.new)
  })
  .subscribe()`,
  },
  ai: {
    title: 'Gemini GenAI Database Analyst',
    filename: 'analyst.ts',
    language: 'typescript',
    code: `// Natural language querying with automated schema introspection
// Generates persistent live widgets for your dashboard
const analysis = await db.ai.query({
  table: 'orders',
  prompt: 'Calculate total revenue from active subscriptions this week',
  pinAsCard: true, // Automatically pins live insight widget
})`,
  },
}

const trustTechs = [
  'Next.js 16',
  'PostgreSQL 16',
  'AWS S3',
  'Google Gemini 2.5',
  'Cursor AI',
  'Claude Code',
  'React Native',
  'TypeScript',
  'PgBouncer',
  'Cloudflare Edge',
  'Render Cloud',
  'Tailwind CSS',
]

export default function LandingPage() {
  const [activeCodeTab, setActiveCodeTab] = useState('database')
  const [copiedKeycap, setCopiedKeycap] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

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
    <div className="min-h-screen bg-[#030303] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
      {/* Background Subtle Grid & Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-indigo-600/[0.07] blur-[140px] pointer-events-none" />
      <div className="fixed top-1/3 left-1/4 w-[450px] h-[450px] bg-purple-600/[0.04] blur-[120px] pointer-events-none" />

      {/* ─── A. Centered Minimalist Navigation Bar ─── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
          {/* Left Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
              Z
            </div>
            <span className="font-gloock text-lg tracking-tight text-white">Zorabase</span>
          </Link>

          {/* Mathematically Dead-Centered Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400 absolute left-1/2 -translate-x-1/2 pointer-events-auto">
            <a href="#how-it-works" className="hover:text-zinc-100 transition-colors">How it Works</a>
            <a href="#architecture" className="hover:text-zinc-100 transition-colors">Architecture</a>
            <a href="#benchmarks" className="hover:text-zinc-100 transition-colors">Benchmarks</a>
            <a href="#sdk" className="hover:text-zinc-100 transition-colors">TypeScript SDK</a>
            <Link href="/dashboard/docs" className="hover:text-zinc-100 transition-colors">API Docs</Link>
          </nav>

          {/* Right Action Group */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 space-y-36">
        {/* ─── Hero Section ─── */}
        <section className="text-center max-w-4xl mx-auto space-y-8 pt-4">
          {/* Tactical Category Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Zero-Bandwidth S3 · Sub-15ms CDC Replication</span>
          </div>

          {/* Editorial Headline with Gloock & Italics */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal text-white font-gloock tracking-tight leading-[1.08]">
            #1 Backend Engine<br />
            for <em className="italic font-normal">Modern Apps &amp; AI Agents</em>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Schema-isolated PostgreSQL tables, direct AWS S3 presigned object uploads, zero-latency CDC WebSocket streams, and native Gemini GenAI intelligence in a single TypeScript SDK.
          </p>

          {/* Tactile 3D Keycap Command Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleCopyKeycap}
              className="group flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] hover:border-indigo-500/40 transition-all cursor-pointer shadow-lg"
              title="Click to copy install command"
            >
              <kbd className="tactile-key">pnpm</kbd>
              <kbd className="tactile-key">add</kbd>
              <kbd className="tactile-key text-indigo-300">@zorabase/sdk</kbd>
              <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 font-mono ml-2">
                {copiedKeycap ? '✓ Copied' : '📋'}
              </span>
            </button>

            <Link
              href="/register"
              className="h-10 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-[0_0_25px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2"
            >
              <span>Create Project Free</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ─── Infinite Marquee Trust Carousel ─── */}
        <section className="relative overflow-hidden py-4 border-y border-white/[0.06] bg-[#070709]/50">
          {/* Left and Right Vignette Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#030303] via-[#030303]/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#030303] via-[#030303]/90 to-transparent z-10 pointer-events-none" />

          {/* 3x Repetition Track for Seamless Infinite Scrolling */}
          <div className="trust-marquee-track flex items-center gap-8">
            {[...trustTechs, ...trustTechs, ...trustTechs].map((tech, idx) => (
              <div
                key={`${tech}-${idx}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-[#09090b] text-xs font-mono text-zinc-400 whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80" />
                <span>{tech}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── B. Bento Card Grid (`#how-it-works`) ─── */}
        <section id="how-it-works" className="space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-normal text-white font-gloock tracking-tight">
              How Zorabase <em className="italic">works</em>
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Three specialized subsystems engineered for maximum developer velocity and zero operational overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 01 (Blue #3b82f6 Glow) */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#09090b] p-7 space-y-5 overflow-hidden group hover:border-blue-500/40 transition-all">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/[0.12] rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/[0.2] transition-all" />
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                  Subsystem 01
                </span>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  0 MB Server Load
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-zinc-100">Direct S3 Presigned Uploads</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Cryptographically signed AWS Signature v4 URLs let clients stream files directly to S3 (<code className="text-zinc-300 font-mono">eu-north-1</code>) with zero Node.js bandwidth or CPU overhead.
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-[#060608] p-3 font-mono text-[11px] text-zinc-400 space-y-1">
                <div className="text-blue-400 font-bold">PUT https://s3.eu-north-1.amazonaws.com/...</div>
                <div className="text-zinc-500 text-[10px]">X-Amz-Signature: 8f92a1bc40e... (Expires 900s)</div>
              </div>
            </div>

            {/* Bento Card 02 (Purple #a855f7 Glow) */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#09090b] p-7 space-y-5 overflow-hidden group hover:border-purple-500/40 transition-all">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/[0.12] rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/[0.2] transition-all" />
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                  Subsystem 02
                </span>
                <span className="text-[11px] font-mono text-purple-300 font-medium">
                  &lt;60ms Buffer
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-zinc-100">Gemini GenAI Database Analyst</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Natural language database querying with dynamic schema introspection. Generate structured summaries and pin live insight widgets with 1 click.
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-[#060608] p-3 font-mono text-[11px] text-zinc-400 space-y-1">
                <div className="text-purple-400 font-bold">&quot;Show pending high-priority orders&quot;</div>
                <div className="text-zinc-500 text-[10px]">⚡ Gemini 2.5 Flash: 14 matching records identified</div>
              </div>
            </div>

            {/* Bento Card 03 (Emerald #10b981 Glow) */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#09090b] p-7 space-y-5 overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/[0.12] rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/[0.2] transition-all" />
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Subsystem 03
                </span>
                <span className="text-[11px] font-mono text-emerald-300 font-medium">
                  ⏱️ &lt;15ms Latency
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-zinc-100">Sub-15ms Realtime CDC Streams</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Attaches directly to PostgreSQL Write-Ahead Log (WAL) logical replication. Dispatches <code className="text-zinc-300 font-mono">INSERT</code>, <code className="text-zinc-300 font-mono">UPDATE</code>, and <code className="text-zinc-300 font-mono">DELETE</code> payloads to active WebSockets.
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-[#060608] p-3 font-mono text-[11px] text-zinc-400 space-y-1">
                <div className="text-emerald-400 font-bold">EVENT: INSERT [orders.id: rec_8f2a]</div>
                <div className="text-zinc-500 text-[10px]">Logical stream decoded &amp; delivered via WS</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Benchmarks Metrics Bar ─── */}
        <section id="benchmarks" className="rounded-2xl border border-white/[0.08] bg-[#09090b] p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-4xl font-normal text-indigo-400 font-gloock">&lt; 15ms</div>
            <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-mono font-semibold">CDC Broadcast Latency</div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-normal text-emerald-400 font-gloock">5,000+ QPS</div>
            <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-mono font-semibold">Query Engine Capacity</div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-normal text-blue-400 font-gloock">0 MB</div>
            <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-mono font-semibold">Server Bandwidth on Uploads</div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-normal text-purple-400 font-gloock">10,000+</div>
            <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-mono font-semibold">WebSockets / Node</div>
          </div>
        </section>

        {/* ─── Interactive Code & SDK Showcase ─── */}
        <section id="sdk" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-normal text-white font-gloock tracking-tight">
                Official TypeScript SDK (<code className="text-indigo-400 font-mono text-xl">@zorabase/sdk</code>)
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Zero external dependencies. Dual ESM and CommonJS bundles with full TypeScript declaration maps.
              </p>
            </div>

            {/* Interactive Tab Selectors */}
            <div className="flex items-center gap-1 bg-[#09090b] border border-white/[0.08] p-1 rounded-xl">
              {Object.keys(codeSnippets).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveCodeTab(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
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

          {/* Simulated Dark Terminal Container */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#09090b] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 bg-[#060608] border-b border-white/[0.06] text-xs font-mono text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-zinc-300">{codeSnippets[activeCodeTab].filename}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-indigo-400 font-semibold">{codeSnippets[activeCodeTab].title}</span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-zinc-300 font-mono transition-colors"
                >
                  {copiedCode ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            <pre className="p-6 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
              <code>{codeSnippets[activeCodeTab].code}</code>
            </pre>
          </div>
        </section>

        {/* ─── D. High-Contrast Light Theme Conversion Card ─── */}
        <section className="rounded-3xl bg-white text-zinc-900 p-8 sm:p-14 shadow-2xl space-y-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
              <span>Instant Cloud Provisioning</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal text-zinc-900 font-gloock tracking-tight leading-tight">
              Ready to ship without <em className="italic">backend friction?</em>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Create a project in 10 seconds, copy your AI agent setup prompt, and build full-stack applications with PostgreSQL, S3, and WebSockets.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto h-11 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/dashboard/docs"
              className="w-full sm:w-auto h-11 px-6 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-800 transition-colors flex items-center justify-center"
            >
              Read Architecture Docs
            </Link>
          </div>

          <p className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-100">
            No credit card required · Free tier with PostgreSQL, S3 Presigning &amp; Gemini GenAI · MIT License
          </p>
        </section>

        {/* ─── E. Giant Brand Watermark ─── */}
        <div className="flex justify-center -mb-20 overflow-hidden select-none pointer-events-none">
          <span className="brand-watermark-text">ZORABASE</span>
        </div>
      </main>

      {/* ─── Minimalist Footer ─── */}
      <footer className="border-t border-white/[0.08] bg-[#09090b] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>All systems operational · v1.0.0 Production Spec</span>
          </div>
          <p>© {new Date().getFullYear()} Zorabase Cloud Infrastructure. Engineered for modern developers &amp; AI agents.</p>
        </div>
      </footer>
    </div>
  )
}
