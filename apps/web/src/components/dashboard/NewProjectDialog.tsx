'use client'

import { useState, useRef, useEffect } from 'react'
import { createProject, type Project } from '@/app/dashboard/actions'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (project: Project, publicKey: string, serverKey: string) => void
}

export default function NewProjectDialog({ open, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setError(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createProject(formData)

    if (result.error || !result.project) {
      setError(result.error || 'Failed to create project')
      setLoading(false)
      return
    }

    setLoading(false)
    onCreated(result.project, result.publicKey!, result.serverKey!)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-[#111113] border border-white/[0.08] rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-zinc-100">New project</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Project name
            </label>
            <input
              ref={inputRef}
              id="new-project-name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={60}
              placeholder="my-app"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
            <p className="mt-1.5 text-xs text-zinc-600">
              Used to identify this project in the dashboard.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-lg border border-white/[0.08] text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12] transition-colors"
            >
              Cancel
            </button>
            <button
              id="create-project-submit"
              type="submit"
              disabled={loading}
              className="flex-1 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium text-white transition-colors"
            >
              {loading ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
