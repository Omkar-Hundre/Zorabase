'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type Project } from '@/app/dashboard/actions'

const sections = [
  {
    label: 'Overview',
    href: (id: string) => `/dashboard/${id}`,
    exact: true,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Database',
    href: (id: string) => `/dashboard/${id}/database`,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    label: 'Auth',
    href: (id: string) => `/dashboard/${id}/auth`,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    soon: true,
  },
  {
    label: 'Storage',
    href: (id: string) => `/dashboard/${id}/storage`,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    label: 'Realtime',
    href: (id: string) => `/dashboard/${id}/realtime`,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: 'Integration',
    href: (id: string) => `/dashboard/${id}/integration`,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    label: 'MCP Server',
    href: (id: string) => `/dashboard/${id}/mcp`,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    label: 'API Keys',
    href: (id: string) => `/dashboard/${id}/keys`,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
  },
]

interface Props {
  project: Project
  children: React.ReactNode
}

export default function ProjectShell({ project, children }: Props) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Project breadcrumb bar */}
      <div className="flex items-center gap-2 px-6 h-11 border-b border-white/[0.06] shrink-0">
        <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Projects
        </Link>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-xs text-zinc-300 font-medium truncate">{project.name}</span>
        <span className="text-xs font-mono text-zinc-600 hidden sm:block">· {project.id}</span>
      </div>

      {/* Sub-navigation */}
      <div className="flex items-center gap-0.5 px-6 border-b border-white/[0.06] shrink-0">
        {sections.map((section) => {
          const href = section.href(project.id)
          const active = section.exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={section.soon ? '#' : href}
              onClick={(e) => section.soon && e.preventDefault()}
              className={`relative flex items-center gap-2 px-3 py-2.5 text-xs transition-colors ${
                section.soon
                  ? 'text-zinc-700 cursor-default'
                  : active
                  ? 'text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>{section.icon}</span>
              {section.label}
              {section.soon && (
                <span className="text-[9px] text-zinc-700 font-medium">Soon</span>
              )}
              {active && !section.soon && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-indigo-500" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  )
}
