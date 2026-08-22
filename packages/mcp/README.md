# `@zorabase/mcp`

**Official Model Context Protocol (MCP) server for Zorabase** — connect Cursor, Claude Desktop, Antigravity, Cline, Windsurf, or any MCP-compatible AI agent directly to your Zorabase project.

## What it does

Once connected, any AI agent can:
- Inspect your schema (list tables, view column types and indexes)
- Query, insert, update, and delete records
- Generate direct AWS S3 presigned upload & download URLs
- Check real-time project health (PostgreSQL, WAL, connections)

All operations go through the Zorabase REST API — the AI **never** touches your database connection string. Destructive DDL (`DROP TABLE`, `TRUNCATE`, `ALTER TABLE`) is blocked at the MCP layer.

---

## Setup

### 1. Get your credentials

Open your project in the [Zorabase Dashboard](https://zorabase.io/dashboard) → **API Keys** tab.

Copy:
- **Project URL** — looks like `https://api.zorabase.io/v1/proj_xxxxxxxxxx`
- **API Key** — looks like `zb_live_xxxxxxxxxx` (use `zb_anon_` for public/read-only)

### 2. Configure your AI agent

**Cursor** — add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "zorabase": {
      "command": "npx",
      "args": ["-y", "@zorabase/mcp"],
      "env": {
        "ZORABASE_PROJECT_URL": "https://api.zorabase.io/v1/proj_YOUR_ID",
        "ZORABASE_API_KEY": "zb_live_YOUR_API_KEY"
      }
    }
  }
}
```

**Claude Desktop** — add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "zorabase": {
      "command": "npx",
      "args": ["-y", "@zorabase/mcp"],
      "env": {
        "ZORABASE_PROJECT_URL": "https://api.zorabase.io/v1/proj_YOUR_ID",
        "ZORABASE_API_KEY": "zb_live_YOUR_API_KEY"
      }
    }
  }
}
```

**Antigravity IDE** — add to `.agents/mcp_config.json`:

```json
{
  "mcpServers": {
    "zorabase": {
      "command": "npx",
      "args": ["-y", "@zorabase/mcp"],
      "env": {
        "ZORABASE_PROJECT_URL": "https://api.zorabase.io/v1/proj_YOUR_ID",
        "ZORABASE_API_KEY": "zb_live_YOUR_API_KEY"
      }
    }
  }
}
```

Restart your agent after saving config.

---

## Available Tools

| Tool | Description |
| :--- | :--- |
| `list_tables` | List all tables in the active project schema |
| `get_table_schema` | Inspect columns, types, and indexes for a table |
| `query_data` | Query rows with filters, ordering, and limit |
| `insert_record` | Insert a record into a table |
| `update_record` | Update records matching conditions |
| `delete_record` | Delete records matching conditions |
| `get_storage_upload_url` | Generate a direct S3 presigned upload URL |
| `get_storage_download_url` | Generate a time-limited S3 download URL |
| `get_project_health` | PostgreSQL & WAL replication health check |

---

## Security

- Public API keys (`zb_anon_`) can read data but **cannot** modify schema.
- `DROP TABLE`, `TRUNCATE`, and `ALTER TABLE` are blocked regardless of key type.
- Keys are passed as environment variables — never embedded in code.

---

## License

MIT © [Omkar Hundre](https://github.com/Omkar-Hundre)
