import { notFound } from 'next/navigation'
import { getProject, getProjectKeys } from '@/app/dashboard/actions'
import Link from 'next/link'

export default async function ApiKeysPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const [project, keys] = await Promise.all([
    getProject(projectId),
    getProjectKeys(projectId),
  ])

  if (!project) notFound()

  const publicKey = keys.find((k) => k.type === 'public')
  const serverKey = keys.find((k) => k.type === 'server')

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">API Keys & Authentication</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Project API credentials for <span className="font-mono text-zinc-200">{project.name}</span> ({project.id}).
          </p>
        </div>
        <Link
          href={`/dashboard/${project.id}/integration`}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2"
        >
          View Integration Prompt & SDK →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Public Key Card */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">Public API Key</h2>
              <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 font-medium">
                Client / Browser Safe
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Use this key in frontend web clients, browser applications, and mobile apps. It identifies the project and is constrained by Row-Level Security policies.
            </p>
          </div>

          <div className="bg-[#08080a] border border-white/[0.08] rounded-lg p-3">
            <code className="text-xs font-mono text-zinc-200 select-all break-all">
              {publicKey?.key_value || 'pk_live_••••••••••••••••'}
            </code>
          </div>
        </div>

        {/* Server Key Card */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">Server Secret Key</h2>
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-medium">
                Backend Only
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Used strictly by trusted server environments (Node.js, serverless functions, background workers). Never expose this key in client-side code or public repositories.
            </p>
          </div>

          <div className="bg-[#08080a] border border-white/[0.08] rounded-lg p-3 flex items-center justify-between">
            <code className="text-xs font-mono text-zinc-500">
              {serverKey ? `••••••••••••••••••••••••••••${serverKey.key_preview}` : 'Protected (shown once at project creation)'}
            </code>
            <span className="text-[11px] text-zinc-500 font-mono">Protected</span>
          </div>
        </div>
      </div>

      {/* Security Guidance & Documentation */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-5 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Security Architecture</h3>
        <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside leading-relaxed">
          <li>All API requests must supply the public key via the <code className="text-zinc-200 font-mono">apikey</code> header or SDK configuration.</li>
          <li>Database queries pass through project namespace isolation and cannot cross project boundaries.</li>
          <li>File uploads use temporary presigned URLs; no private S3 secrets are ever sent to client devices.</li>
        </ul>
      </div>
    </div>
  )
}
