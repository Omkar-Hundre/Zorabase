'use client'

import { useState } from 'react'
import { type Project } from '@/app/dashboard/actions'

interface Props {
  project: Project
  publicKey: string | null
  serverKeyPreview: string | null
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] transition-all shrink-0"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Copied</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  )
}

export default function IntegrationView({ project, publicKey, serverKeyPreview }: Props) {
  const [activeSnippetTab, setActiveSnippetTab] = useState<'init' | 'db' | 'storage' | 'auth' | 'rest'>('init')

  const apiUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/v1/${project.id}` : `http://localhost:3000/api/v1/${project.id}`
  const pubKey = publicKey || 'pk_live_your_public_api_key'

  const envSnippet = `# Zorabase Configuration
NEXT_PUBLIC_ZORABASE_URL=${apiUrl}
NEXT_PUBLIC_ZORABASE_PUBLIC_KEY=${pubKey}
# Server-only key (keep in backend / server environment only)
ZORABASE_SERVER_KEY=sk_live_your_secret_key`

  const aiSetupPrompt = `You are integrating this application with Zorabase as its backend service.

Backend configuration:
- Backend URL: ${apiUrl}
- Project ID: ${project.id}
- Public API Key: ${pubKey}
- SDK Package: @zorabase/sdk

Instructions:
1. Install the official SDK: \`npm install @zorabase/sdk\` (or pnpm/yarn equivalent).
2. Store the backend URL and public API key in your environment variables:
   NEXT_PUBLIC_ZORABASE_URL=${apiUrl}
   NEXT_PUBLIC_ZORABASE_PUBLIC_KEY=${pubKey}
3. Never expose server API keys in client-side / browser code.
4. Use the database APIs through the SDK query builder (\`client.from('table').select(...)\`).
5. For file uploads, use the storage API (\`client.storage.from('bucket').upload(...)\`) with signed URLs.
6. Server-side Row-Level Security policies are enforced automatically.
7. Inspect the project before writing code, adhere to existing architectural conventions, and do not create duplicate database layers.
8. Never log passwords, access tokens, refresh tokens, or secret credentials.

Before modifying code:
- Check existing framework and environment setup.
- Initialize the Zorabase client in a shared lib/utility file.
- Verify connectivity before implementing feature logic.`

  const snippets = {
    init: `import { createClient } from '@zorabase/sdk'

export const zorabase = createClient({
  url: process.env.NEXT_PUBLIC_ZORABASE_URL!,
  apiKey: process.env.NEXT_PUBLIC_ZORABASE_PUBLIC_KEY!,
})`,
    db: `// Query records with filters
const { data, error } = await zorabase
  .from('users')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(20)

// Insert record
const { data: inserted, error: insertError } = await zorabase
  .from('posts')
  .insert({
    title: 'Hello Zorabase',
    content: 'Building faster with BaaS',
  })`,
    storage: `// Direct upload using presigned S3 URL
const file = event.target.files[0]
const { data, error } = await zorabase.storage
  .from('avatars')
  .upload(\`profiles/\${userId}/avatar.png\`, file)

// Get signed download URL
const { data: signed } = await zorabase.storage
  .from('avatars')
  .createSignedUrl('profiles/user_123/avatar.png', 3600)`,
    auth: `// Sign up new user
const { data, error } = await zorabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure_password_123',
})

// Sign in
const { data: session, error: loginError } = await zorabase.auth.signIn({
  email: 'user@example.com',
  password: 'secure_password_123',
})`,
    rest: `# Fetch records via REST API
curl "${apiUrl}/data/users?limit=20" \\
  -H "apikey: ${pubKey}"

# Insert record via REST API
curl -X POST "${apiUrl}/data/users" \\
  -H "apikey: ${pubKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice", "email": "alice@example.com"}'`
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Integration & AI Agent Setup</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Connect your application using the TypeScript SDK, REST API, or copy the AI coding agent prompt.
          </p>
        </div>
        <div className="text-xs font-mono text-zinc-400 bg-white/[0.03] px-3 py-1 rounded-md border border-white/[0.08]">
          Package: <span className="text-indigo-300">@zorabase/sdk</span>
        </div>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Prompt & Credentials (6 cols on desktop) */}
        <div className="lg:col-span-6 space-y-6">
          {/* AI Setup Prompt Box */}
          <section className="rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/[0.08] to-transparent p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                <h2 className="text-sm font-semibold text-zinc-100">AI Coding Agent Setup Prompt</h2>
              </div>
              <CopyButton text={aiSetupPrompt} label="Copy AI Prompt" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Paste this prompt into Cursor, Claude Code, Windsurf, or Copilot to let your AI coding agent connect this backend autonomously.
            </p>
            <div className="rounded-lg bg-[#08080a] border border-white/[0.08] p-3 max-h-52 overflow-y-auto">
              <pre className="text-[11px] font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {aiSetupPrompt}
              </pre>
            </div>
          </section>

          {/* Project API Credentials */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Project Credentials</h2>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.04]">
              <div className="p-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-xs text-zinc-400 block font-medium">Project Base URL</span>
                  <code className="text-xs font-mono text-zinc-200 block truncate">{apiUrl}</code>
                </div>
                <CopyButton text={apiUrl} />
              </div>

              <div className="p-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-xs text-zinc-400 block font-medium">Project ID</span>
                  <code className="text-xs font-mono text-zinc-200 block truncate">{project.id}</code>
                </div>
                <CopyButton text={project.id} />
              </div>

              <div className="p-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-medium">Public API Key</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.2 rounded border border-emerald-400/20">Client safe</span>
                  </div>
                  <code className="text-xs font-mono text-zinc-200 block truncate">{publicKey || 'pk_live_••••••••••••••••'}</code>
                </div>
                {publicKey && <CopyButton text={publicKey} />}
              </div>

              <div className="p-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-medium">Server API Key</span>
                    <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">Secret</span>
                  </div>
                  <code className="text-xs font-mono text-zinc-500 block truncate">
                    {serverKeyPreview ? `••••••••••••${serverKeyPreview}` : 'Protected'}
                  </code>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono shrink-0">Backend Only</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Environment Variables & Code Snippets (6 cols on desktop) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Environment Variables */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Environment Variables (.env)</h2>
              <CopyButton text={envSnippet} label="Copy .env" />
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
                {envSnippet}
              </pre>
            </div>
          </section>

          {/* Interactive Code Snippets */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Integration Examples</h2>
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] overflow-hidden">
              {/* Tabs */}
              <div className="flex items-center border-b border-white/[0.06] bg-white/[0.02] px-2 overflow-x-auto">
                {[
                  { id: 'init', label: 'Client Setup' },
                  { id: 'db', label: 'Database' },
                  { id: 'storage', label: 'Storage' },
                  { id: 'auth', label: 'Auth' },
                  { id: 'rest', label: 'REST API' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSnippetTab(tab.id as any)}
                    className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors shrink-0 ${
                      activeSnippetTab === tab.id
                        ? 'border-indigo-500 text-white'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4 relative">
                <div className="absolute right-4 top-4">
                  <CopyButton text={snippets[activeSnippetTab]} />
                </div>
                <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto pr-16 max-h-72">
                  {snippets[activeSnippetTab]}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
