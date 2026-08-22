'use client'

import { useState } from 'react'

interface Props {
  projectName: string
  projectUrl: string
  apiKey: string
}

const AGENTS = [
  { id: 'cursor',  label: 'Cursor',         file: '.cursor/mcp.json' },
  { id: 'claude',  label: 'Claude Desktop', file: 'claude_desktop_config.json' },
  { id: 'agy',     label: 'Antigravity',    file: '.agents/mcp_config.json' },
  { id: 'generic', label: 'Other (Generic MCP)', file: 'mcp.json' },
]

const TOOLS = [
  { name: 'list_tables',              desc: 'List all tables in the project schema' },
  { name: 'get_table_schema',         desc: 'Inspect column types and indexes for any table' },
  { name: 'query_data',               desc: 'Query rows with filters, ordering, and limit' },
  { name: 'insert_record',            desc: 'Insert a record into any table' },
  { name: 'update_record',            desc: 'Update records matching conditions' },
  { name: 'delete_record',            desc: 'Delete records matching conditions' },
  { name: 'get_storage_upload_url',   desc: 'Generate a direct AWS S3 presigned upload URL' },
  { name: 'get_storage_download_url', desc: 'Generate a time-limited S3 download URL' },
  { name: 'get_project_health',       desc: 'Check PostgreSQL, WAL, and storage health' },
]

export default function McpPageClient({ projectName, projectUrl, apiKey }: Props) {
  const [activeAgent, setActiveAgent] = useState('cursor')
  const [copied, setCopied] = useState<string | null>(null)

  const config = {
    mcpServers: {
      zorabase: {
        command: 'npx',
        args: ['-y', '@zorabase/mcp'],
        env: {
          ZORABASE_PROJECT_URL: projectUrl,
          ZORABASE_API_KEY: apiKey,
        },
      },
    },
  }

  const configStr = JSON.stringify(config, null, 2)
  const agentFile = AGENTS.find((a) => a.id === activeAgent)?.file ?? 'mcp.json'

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="w-full space-y-8 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">MCP Server</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Connect Cursor, Claude, or any AI agent to{' '}
            <span className="font-mono text-zinc-200">{projectName}</span> via the
            Model Context Protocol.
          </p>
        </div>
        <a
          href="https://modelcontextprotocol.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-sky-400 hover:text-sky-300 transition-colors shrink-0"
        >
          MCP Docs ↗
        </a>
      </div>

      {/* Install command */}
      <div className="rounded-xl border border-white/[0.08] bg-[#09090d] p-5 space-y-3">
        <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Step 1 — Install (or use npx, no install needed)
        </h2>
        <div className="flex items-center justify-between gap-3 bg-[#050507] border border-white/[0.06] rounded-lg px-4 py-2.5">
          <code className="text-sm font-mono text-sky-300">
            npx -y @zorabase/mcp
          </code>
          <button
            onClick={() => copy('npx -y @zorabase/mcp', 'npx')}
            className="text-[10px] font-mono text-zinc-500 hover:text-zinc-200 px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-colors shrink-0"
          >
            {copied === 'npx' ? '✓ copied' : 'copy'}
          </button>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          The MCP server is published as <code className="text-zinc-300">@zorabase/mcp</code>.
          Agents use <code className="text-zinc-300">npx</code> to pull and run it automatically —
          no global installation required.
        </p>
      </div>

      {/* Config generator */}
      <div className="rounded-xl border border-white/[0.08] bg-[#09090d] p-5 space-y-4">
        <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Step 2 — Add config to your AI agent
        </h2>

        {/* Agent tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#040406] border border-white/[0.06] rounded-xl w-fit">
          {AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeAgent === agent.id
                  ? 'bg-[#203665] text-white border border-sky-400/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {agent.label}
            </button>
          ))}
        </div>

        {/* File path hint */}
        <p className="text-xs text-zinc-500">
          Add to{' '}
          <code className="text-zinc-300 bg-white/[0.05] px-1.5 py-0.5 rounded">
            {agentFile}
          </code>{' '}
          in your project or home directory.
        </p>

        {/* Config code block */}
        <div className="rounded-xl border border-white/[0.08] bg-[#050508] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
              <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
              <span className="w-2 h-2 rounded-full bg-[#28c840]" />
              <span className="ml-2 text-[11px] text-zinc-500 font-mono">{agentFile}</span>
            </div>
            <button
              onClick={() => copy(configStr, 'config')}
              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-200 px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
            >
              {copied === 'config' ? '✓ copied' : 'copy'}
            </button>
          </div>
          <pre className="px-5 py-4 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto">
            <code>{configStr}</code>
          </pre>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed">
          ⚡ Your credentials are already pre-filled above. Restart your agent after saving.
        </p>
      </div>

      {/* Environment variables alternative */}
      <div className="rounded-xl border border-white/[0.08] bg-[#09090d] p-5 space-y-4">
        <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Alternative — run from terminal
        </h2>
        <div className="flex items-center justify-between gap-3 bg-[#050507] border border-white/[0.06] rounded-lg px-4 py-2.5">
          <code className="text-xs font-mono text-zinc-300 break-all">
            ZORABASE_PROJECT_URL=&quot;{projectUrl}&quot; ZORABASE_API_KEY=&quot;{apiKey}&quot; npx @zorabase/mcp
          </code>
          <button
            onClick={() =>
              copy(
                `ZORABASE_PROJECT_URL="${projectUrl}" ZORABASE_API_KEY="${apiKey}" npx @zorabase/mcp`,
                'env'
              )
            }
            className="text-[10px] font-mono text-zinc-500 hover:text-zinc-200 px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-colors shrink-0"
          >
            {copied === 'env' ? '✓ copied' : 'copy'}
          </button>
        </div>
      </div>

      {/* Available tools */}
      <div className="rounded-xl border border-white/[0.08] bg-[#09090d] p-5 space-y-4">
        <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Available Tools ({TOOLS.length})
        </h2>
        <div className="divide-y divide-white/[0.04]">
          {TOOLS.map((tool) => (
            <div key={tool.name} className="py-3 flex items-start justify-between gap-4">
              <code className="text-xs font-mono text-sky-300 shrink-0">{tool.name}</code>
              <p className="text-xs text-zinc-400 text-right">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security note */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 flex items-start gap-3">
        <span className="text-amber-400 text-sm shrink-0">🔒</span>
        <div className="text-xs text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-300">Security Note</p>
          <p>
            Use your <span className="text-zinc-200">public key</span> for read-heavy AI agents in
            frontend environments. The MCP server blocks all destructive DDL (
            <code className="text-zinc-300">DROP TABLE</code>,{' '}
            <code className="text-zinc-300">TRUNCATE</code>,{' '}
            <code className="text-zinc-300">ALTER TABLE</code>) regardless of key type.
          </p>
        </div>
      </div>
    </div>
  )
}
