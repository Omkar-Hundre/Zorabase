'use client'

import { useState } from 'react'
import Link from 'next/link'
import { type Project } from '@/app/dashboard/actions'
import NewProjectDialog from './NewProjectDialog'
import ProjectCreatedScreen from './ProjectCreatedScreen'

interface Props {
  projects: Project[]
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function ProjectsView({ projects }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [created, setCreated] = useState<{
    project: Project
    publicKey: string
    serverKey: string
  } | null>(null)

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold text-zinc-100">Projects</h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            Each project has its own database, API keys, and configuration.
          </p>
        </div>
        <button
          id="open-new-project-dialog"
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New project
        </button>
      </div>

      {/* Project list */}
      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.07] bg-white/[0.01] py-16 flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
              <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-400 mb-1">No projects</p>
          <p className="text-xs text-zinc-600 max-w-xs mb-5">
            Create a project to get a database, API keys, and an integration prompt for your coding tool.
          </p>
          <button
            onClick={() => setDialogOpen(true)}
            className="h-8 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/${project.id}`}
              className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] p-4 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                    <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  project.status === 'active'
                    ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                    : 'text-zinc-500 border-zinc-700 bg-white/[0.02]'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm font-medium text-zinc-200 group-hover:text-white truncate transition-colors mb-1">
                {project.name}
              </p>
              <p className="text-xs font-mono text-zinc-600 truncate mb-3">{project.id}</p>
              <p className="text-xs text-zinc-600">Created {timeAgo(project.created_at)}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <NewProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(project, publicKey, serverKey) => {
          setDialogOpen(false)
          setCreated({ project, publicKey, serverKey })
        }}
      />

      {created && (
        <ProjectCreatedScreen
          project={created.project}
          publicKey={created.publicKey}
          serverKey={created.serverKey}
          onDismiss={() => setCreated(null)}
        />
      )}
    </>
  )
}
