#!/usr/bin/env node
/**
 * @zorabase/mcp — Zorabase MCP Server
 *
 * Connects any MCP-compatible AI agent (Cursor, Claude Desktop,
 * Antigravity, Cline, Windsurf) to a Zorabase project.
 *
 * Usage: npx -y @zorabase/mcp
 *
 * Environment variables:
 *   ZORABASE_PROJECT_URL  — Your project URL (e.g. https://api.zorabase.io/v1/proj_xxx)
 *   ZORABASE_API_KEY      — Your project API key (zb_live_xxx or zb_anon_xxx)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

// ─── Config ───────────────────────────────────────────────────────────────────

const PROJECT_URL = process.env.ZORABASE_PROJECT_URL?.replace(/\/$/, '')
const API_KEY = process.env.ZORABASE_API_KEY

if (!PROJECT_URL || !API_KEY) {
  console.error('[zorabase-mcp] Error: Missing required environment variables.')
  console.error('[zorabase-mcp]   ZORABASE_PROJECT_URL — your project URL')
  console.error('[zorabase-mcp]   ZORABASE_API_KEY     — your project API key')
  process.exit(1)
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function zbFetch(
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  const url = `${PROJECT_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'X-Zorabase-Client': 'mcp/0.1.0',
      ...(options.headers ?? {}),
    },
  })

  const body = await res.json().catch(() => ({ error: 'Non-JSON response' }))

  if (!res.ok) {
    const msg = (body as { error?: string }).error ?? res.statusText
    throw new Error(`Zorabase API error (${res.status}): ${msg}`)
  }
  return body
}

// ─── Guardrail — block destructive DDL ────────────────────────────────────────

const BLOCKED = /\b(DROP|TRUNCATE|ALTER TABLE|RENAME TABLE)\b/i

function guardSql(sql: string) {
  if (BLOCKED.test(sql)) {
    throw new Error(
      'Blocked: Destructive DDL (DROP, TRUNCATE, ALTER TABLE) is not allowed via MCP. Use the Zorabase dashboard for schema changes.'
    )
  }
}

// ─── Tool Definitions ─────────────────────────────────────────────────────────

const tools = [
  {
    name: 'list_tables',
    description: 'List all tables in the active Zorabase project schema.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_table_schema',
    description:
      'Inspect column names, types, and indexes for a specific table.',
    inputSchema: {
      type: 'object',
      properties: {
        table_name: { type: 'string', description: 'Name of the table to inspect.' },
      },
      required: ['table_name'],
    },
  },
  {
    name: 'query_data',
    description:
      'Query records from a Zorabase table with optional column selection, equality filters, ordering, and limit.',
    inputSchema: {
      type: 'object',
      properties: {
        table_name: { type: 'string', description: 'Table to query.' },
        columns: {
          type: 'string',
          description: 'Comma-separated column names or "*". Default: "*".',
        },
        filters: {
          type: 'object',
          description: 'Key-value equality filters, e.g. { "status": "active" }.',
          additionalProperties: true,
        },
        order_by: { type: 'string', description: 'Column name to order by.' },
        ascending: { type: 'boolean', description: 'Sort direction. Default true.' },
        limit: { type: 'number', description: 'Maximum rows to return. Default 50.' },
      },
      required: ['table_name'],
    },
  },
  {
    name: 'insert_record',
    description: 'Insert a single record into a Zorabase table.',
    inputSchema: {
      type: 'object',
      properties: {
        table_name: { type: 'string', description: 'Table to insert into.' },
        record: {
          type: 'object',
          description: 'Key-value pairs of the record to insert.',
          additionalProperties: true,
        },
      },
      required: ['table_name', 'record'],
    },
  },
  {
    name: 'update_record',
    description: 'Update records in a Zorabase table matching specific conditions.',
    inputSchema: {
      type: 'object',
      properties: {
        table_name: { type: 'string', description: 'Table to update.' },
        record: {
          type: 'object',
          description: 'Fields to set on matching rows.',
          additionalProperties: true,
        },
        match: {
          type: 'object',
          description: 'Equality conditions to match rows, e.g. { "id": "uuid-here" }.',
          additionalProperties: true,
        },
      },
      required: ['table_name', 'record', 'match'],
    },
  },
  {
    name: 'delete_record',
    description: 'Delete records from a Zorabase table matching specific conditions.',
    inputSchema: {
      type: 'object',
      properties: {
        table_name: { type: 'string', description: 'Table to delete from.' },
        match: {
          type: 'object',
          description: 'Equality conditions to match rows, e.g. { "id": "uuid-here" }.',
          additionalProperties: true,
        },
      },
      required: ['table_name', 'match'],
    },
  },
  {
    name: 'get_storage_upload_url',
    description:
      'Generate a direct AWS S3 presigned upload URL. The client uploads the binary directly to S3 — zero server bandwidth consumed.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string', description: 'Storage bucket name.' },
        file_path: { type: 'string', description: 'Destination path, e.g. "users/avatar.png".' },
        content_type: { type: 'string', description: 'MIME type, e.g. "image/png".' },
      },
      required: ['bucket', 'file_path', 'content_type'],
    },
  },
  {
    name: 'get_storage_download_url',
    description:
      'Generate a time-limited AWS S3 signed download URL for a stored file.',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string', description: 'Storage bucket name.' },
        file_path: { type: 'string', description: 'File path in the bucket.' },
        expires_in: {
          type: 'number',
          description: 'Expiry in seconds (default: 3600).',
        },
      },
      required: ['bucket', 'file_path'],
    },
  },
  {
    name: 'get_project_health',
    description:
      'Check PostgreSQL connectivity, WAL replication status, active connections, and storage availability for this Zorabase project.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
]

// ─── Zod schemas for runtime argument validation ───────────────────────────────

const QueryDataArgs = z.object({
  table_name: z.string(),
  columns: z.string().default('*'),
  filters: z.record(z.unknown()).optional(),
  order_by: z.string().optional(),
  ascending: z.boolean().default(true),
  limit: z.number().int().positive().default(50),
})

const InsertArgs = z.object({
  table_name: z.string(),
  record: z.record(z.unknown()),
})

const UpdateArgs = z.object({
  table_name: z.string(),
  record: z.record(z.unknown()),
  match: z.record(z.unknown()),
})

const DeleteArgs = z.object({
  table_name: z.string(),
  match: z.record(z.unknown()),
})

const TableNameArgs = z.object({ table_name: z.string() })

const UploadUrlArgs = z.object({
  bucket: z.string(),
  file_path: z.string(),
  content_type: z.string(),
})

const DownloadUrlArgs = z.object({
  bucket: z.string(),
  file_path: z.string(),
  expires_in: z.number().int().positive().default(3600),
})

// ─── Server ───────────────────────────────────────────────────────────────────

const server = new Server(
  { name: 'zorabase', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }))

// Call tool
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params

  try {
    switch (name) {
      // ── list_tables ────────────────────────────────────────────────────────
      case 'list_tables': {
        const data = await zbFetch('/meta/tables')
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        }
      }

      // ── get_table_schema ───────────────────────────────────────────────────
      case 'get_table_schema': {
        const { table_name } = TableNameArgs.parse(args)
        const data = await zbFetch(`/meta/tables/${encodeURIComponent(table_name)}`)
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        }
      }

      // ── query_data ─────────────────────────────────────────────────────────
      case 'query_data': {
        const { table_name, columns, filters, order_by, ascending, limit } =
          QueryDataArgs.parse(args)

        const params = new URLSearchParams()
        params.set('select', columns)
        params.set('limit', String(limit))
        if (order_by) {
          params.set('order', `${order_by}.${ascending ? 'asc' : 'desc'}`)
        }
        if (filters) {
          for (const [k, v] of Object.entries(filters)) {
            params.set(k, `eq.${v}`)
          }
        }

        const data = await zbFetch(
          `/data/${encodeURIComponent(table_name)}?${params.toString()}`
        )
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        }
      }

      // ── insert_record ──────────────────────────────────────────────────────
      case 'insert_record': {
        const { table_name, record } = InsertArgs.parse(args)
        const data = await zbFetch(`/data/${encodeURIComponent(table_name)}`, {
          method: 'POST',
          body: JSON.stringify(record),
        })
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        }
      }

      // ── update_record ──────────────────────────────────────────────────────
      case 'update_record': {
        const { table_name, record, match } = UpdateArgs.parse(args)
        const params = new URLSearchParams()
        for (const [k, v] of Object.entries(match)) {
          params.set(k, `eq.${v}`)
        }
        const data = await zbFetch(
          `/data/${encodeURIComponent(table_name)}?${params.toString()}`,
          { method: 'PATCH', body: JSON.stringify(record) }
        )
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        }
      }

      // ── delete_record ──────────────────────────────────────────────────────
      case 'delete_record': {
        const { table_name, match } = DeleteArgs.parse(args)
        const params = new URLSearchParams()
        for (const [k, v] of Object.entries(match)) {
          params.set(k, `eq.${v}`)
        }
        const data = await zbFetch(
          `/data/${encodeURIComponent(table_name)}?${params.toString()}`,
          { method: 'DELETE' }
        )
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        }
      }

      // ── get_storage_upload_url ─────────────────────────────────────────────
      case 'get_storage_upload_url': {
        const { bucket, file_path, content_type } = UploadUrlArgs.parse(args)
        const data = await zbFetch(
          `/storage/${encodeURIComponent(bucket)}/upload-url`,
          {
            method: 'POST',
            body: JSON.stringify({ path: file_path, contentType: content_type }),
          }
        )
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        }
      }

      // ── get_storage_download_url ───────────────────────────────────────────
      case 'get_storage_download_url': {
        const { bucket, file_path, expires_in } = DownloadUrlArgs.parse(args)
        const data = await zbFetch(
          `/storage/${encodeURIComponent(bucket)}/download-url`,
          {
            method: 'POST',
            body: JSON.stringify({ path: file_path, expiresIn: expires_in }),
          }
        )
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        }
      }

      // ── get_project_health ─────────────────────────────────────────────────
      case 'get_project_health': {
        const data = await zbFetch('/health')
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    }
  }
})

// ─── Start ────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[zorabase-mcp] Server running on stdio')
  console.error(`[zorabase-mcp] Connected to: ${PROJECT_URL}`)
}

main().catch((err) => {
  console.error('[zorabase-mcp] Fatal:', err)
  process.exit(1)
})
