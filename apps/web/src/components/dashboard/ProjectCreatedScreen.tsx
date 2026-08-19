'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Project } from '@/app/dashboard/actions'

interface Props {
  project: Project
  publicKey: string
  serverKey: string
  onDismiss: () => void
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="shrink-0 flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-white/[0.08] text-xs text-zinc-400 hover:text-zinc-200 hover:border-white/[0.14] transition-colors"
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  )
}

function KeyRow({ label, value, sensitive }: { label: string; value: string; sensitive?: boolean }) {
  const [visible, setVisible] = useState(!sensitive)
  const display = visible ? value : value.slice(0, 12) + '••••••••••••••••••••••••••••••••'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{label}</span>
        {sensitive && (
          <button
            onClick={() => setVisible(!visible)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {visible ? 'Hide' : 'Reveal'}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
        <code className="flex-1 text-xs font-mono text-zinc-300 truncate">{display}</code>
        <CopyButton value={value} />
      </div>
    </div>
  )
}

export default function ProjectCreatedScreen({ project, publicKey, serverKey, onDismiss }: Props) {
  const router = useRouter()

  function go() {
    onDismiss()
    router.push(`/dashboard/${project.id}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-[#111113] border border-white/[0.08] rounded-xl shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-zinc-100">Project created</h2>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Warning */}
          <div className="flex gap-3 bg-amber-400/5 border border-amber-400/20 rounded-lg px-4 py-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 mt-0.5 shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              The server key is shown once and cannot be recovered. Copy it now and store it securely — never put it in browser code or commit it to version control.
            </p>
          </div>

          {/* Keys */}
          <div className="space-y-3">
            <KeyRow label="Project ID" value={project.id} />
            <KeyRow label="Public key — safe for browser and mobile apps" value={publicKey} />
            <KeyRow label="Server key — backend only, treat like a password" value={serverKey} sensitive />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/[0.06]">
          <button
            id="go-to-project-btn"
            onClick={go}
            className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors"
          >
            Go to project
          </button>
        </div>
      </div>
    </div>
  )
}
