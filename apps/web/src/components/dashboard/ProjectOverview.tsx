'use client'

import { useState } from 'react'
import Link from 'next/link'
import { type Project } from '@/app/dashboard/actions'

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0 gap-3">
      <span className="text-xs text-zinc-500 w-32 shrink-0">{label}</span>
      <span className={`flex-1 text-xs text-zinc-300 truncate ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
      <button
        onClick={copy}
        className="shrink-0 flex items-center gap-1 h-6 px-2 rounded border border-white/[0.07] text-[11px] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12] transition-colors"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function KeyPreviewRow({ label, preview, note }: { label: string; preview: string | null; note?: string }) {
  return (
    <div className="flex items-start py-2.5 border-b border-white/[0.04] last:border-0 gap-3">
      <span className="text-xs text-zinc-500 w-32 shrink-0 mt-0.5">{label}</span>
      <div className="flex-1">
        {preview ? (
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-zinc-400">••••••••••••{preview}</code>
            {note && <span className="text-[11px] text-zinc-600 font-mono">({note})</span>}
          </div>
        ) : (
          <span className="text-xs text-zinc-600">Not available</span>
        )}
      </div>
    </div>
  )
}

interface Props {
  project: Project
  publicKeyPreview: string | null
  serverKeyPreview: string | null
}

const features = [
  { label: 'Database & GenAI', desc: 'Schema tables, CRUD, query builder & Gemini insights', status: 'live', href: (id: string) => `/dashboard/${id}/database` },
  { label: 'Storage (AWS S3)', desc: 'Direct presigned uploads, buckets & metadata', status: 'live', href: (id: string) => `/dashboard/${id}/storage` },
  { label: 'Realtime Engine', desc: 'Live WebSocket subscriptions & Postgres CDC replication', status: 'live', href: (id: string) => `/dashboard/${id}/realtime` },
  { label: 'AI Agent Prompt', desc: '1-click setup prompt for Cursor, Claude & Windsurf', status: 'live', href: (id: string) => `/dashboard/${id}/integration` },
]

export default function ProjectOverview({ project, publicKeyPreview, serverKeyPreview }: Props) {
  const created = new Date(project.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  const apiUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/v1/${project.id}` : `http://localhost:3000/api/v1/${project.id}`

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Banner / Summary Header */}
      <div className="rounded-xl border border-white/[0.08] bg-gradient-to-r from-indigo-500/[0.08] via-white/[0.02] to-transparent p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">{project.name}</h1>
            <span className="text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full font-medium">
              {project.status}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Project ID: {project.id}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/${project.id}/integration`}
            className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
            Integration & AI Setup
          </Link>
        </div>
      </div>

      {/* Main 2-Column Responsive Grid (Full Screen Utilization) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Config & Keys (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Project Details */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Project Details</h2>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <InfoRow label="Name" value={project.name} />
              <InfoRow label="Project ID" value={project.id} mono />
              <InfoRow label="Base API URL" value={apiUrl} mono />
              <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                <span className="text-xs text-zinc-500 w-32 shrink-0">Region (S3)</span>
                <span className="text-xs text-zinc-300 font-mono">eu-north-1 (Stockholm)</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs text-zinc-500 w-32 shrink-0">Created</span>
                <span className="text-xs text-zinc-400">{created}</span>
              </div>
            </div>
          </section>

          {/* API Keys preview */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">API Keys</h2>
              <Link href={`/dashboard/${project.id}/keys`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Manage keys →
              </Link>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <KeyPreviewRow
                label="Public key"
                preview={publicKeyPreview}
                note="Client safe"
              />
              <KeyPreviewRow
                label="Server key"
                preview={serverKeyPreview}
                note="Backend only"
              />
            </div>
          </section>

          {/* Features Grid */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <Link
                  key={f.label}
                  href={f.href(project.id)}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-3.5 space-y-1.5 transition-all block group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors">{f.label}</span>
                    <span className="text-[10px] text-emerald-400 border border-emerald-400/20 bg-emerald-400/5 rounded px-1.5 py-0.2 font-medium">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{f.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Code Quick Start & SDK (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Start & SDK */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">SDK Quick Start</h2>
              <Link href={`/dashboard/${project.id}/integration`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                Full AI Prompt & Config →
              </Link>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-mono">TypeScript / Next.js Client</span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">npm install @zorabase/sdk</span>
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
{`import { createClient } from '@zorabase/sdk'

// 1. Initialize client
export const db = createClient({
  url: '${apiUrl}',
  apiKey: process.env.NEXT_PUBLIC_ZORABASE_PUBLIC_KEY!,
})

// 2. Query data safely
const { data, error } = await db
  .from('users')
  .select('*')
  .eq('status', 'active')
  .limit(20)

// 3. Upload files directly to S3
const { data: upload } = await db.storage
  .from('avatars')
  .upload(\`users/\${userId}/profile.png\`, file)`}
              </pre>
            </div>
          </section>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href={`/dashboard/${project.id}/database`}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] p-4 space-y-1 block transition-all"
            >
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
                <span>Database & GenAI</span>
              </div>
              <p className="text-xs text-zinc-400">View tables, records, and natural language analytics.</p>
            </Link>

            <Link
              href={`/dashboard/${project.id}/storage`}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] p-4 space-y-1 block transition-all"
            >
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>S3 Storage</span>
              </div>
              <p className="text-xs text-zinc-400">Manage buckets and direct presigned S3 uploads.</p>
            </Link>

            <Link
              href={`/dashboard/${project.id}/integration`}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] p-4 space-y-1 block transition-all"
            >
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                </svg>
                <span>AI Agent Prompt</span>
              </div>
              <p className="text-xs text-zinc-400">Copy 1-click integration prompt for coding agents.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
