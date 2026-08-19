'use client'

import { useState, useTransition } from 'react'
import {
  type DbTable,
  type DbColumn,
  type DbRecord,
  type AiInfoCard,
  createTable,
  deleteTable,
  listColumns,
  listRecords,
  insertRecord,
  deleteRecord,
  askDatabaseAI,
  pinInfoCard,
  deletePinnedCard,
} from '@/app/dashboard/[projectId]/database/actions'

interface Props {
  projectId: string
  initialTables: DbTable[]
  initialPinnedCards: AiInfoCard[]
}

const SUPPORTED_TYPES = [
  { value: 'text', label: 'Text (string)' },
  { value: 'integer', label: 'Integer (int4)' },
  { value: 'numeric', label: 'Numeric (float/decimal)' },
  { value: 'boolean', label: 'Boolean (true/false)' },
  { value: 'jsonb', label: 'JSON / Document' },
  { value: 'timestamptz', label: 'Timestamp (date/time)' },
]

export default function DatabaseView({ projectId, initialTables, initialPinnedCards }: Props) {
  const [tables, setTables] = useState<DbTable[]>(initialTables)
  const [selectedTable, setSelectedTable] = useState<DbTable | null>(initialTables[0] || null)
  const [columns, setColumns] = useState<DbColumn[]>([])
  const [records, setRecords] = useState<DbRecord[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Pinned Info Cards State
  const [pinnedCards, setPinnedCards] = useState<AiInfoCard[]>(initialPinnedCards)

  // GenAI Query State
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<{
    title: string
    metric: string
    summary: string
  } | null>(null)
  const [pinning, setPinning] = useState(false)
  const [isPinnedNow, setIsPinnedNow] = useState(false)

  // Create Table Modal State
  const [createTableModal, setCreateTableModal] = useState(false)
  const [newTableName, setNewTableName] = useState('')
  const [newTableDesc, setNewTableDesc] = useState('')
  const [customCols, setCustomCols] = useState<Array<{ name: string; data_type: string; is_nullable: boolean }>>([
    { name: 'name', data_type: 'text', is_nullable: false },
    { name: 'status', data_type: 'text', is_nullable: true },
  ])
  const [creatingTable, setCreatingTable] = useState(false)
  const [tableError, setTableError] = useState<string | null>(null)

  // Insert Record Modal State
  const [insertRecordModal, setInsertRecordModal] = useState(false)
  const [newRowData, setNewRowData] = useState<Record<string, string>>({})
  const [insertingRow, setInsertingRow] = useState(false)

  const [isPending, startTransition] = useTransition()

  // Load columns & records when table changes
  async function loadTableDetails(table: DbTable) {
    setSelectedTable(table)
    setLoadingData(true)
    try {
      const [cols, recs] = await Promise.all([
        listColumns(table.id),
        listRecords(projectId, table.name),
      ])
      setColumns(cols)
      setRecords(recs)
    } finally {
      setLoadingData(false)
    }
  }

  // Handle Create Table
  async function handleCreateTable(e: React.FormEvent) {
    e.preventDefault()
    setCreatingTable(true)
    setTableError(null)

    const res = await createTable(projectId, newTableName, newTableDesc, customCols)
    if (res.error || !res.table) {
      setTableError(res.error || 'Failed to create table')
      setCreatingTable(false)
      return
    }

    const updated = [...tables, res.table]
    setTables(updated)
    setCreateTableModal(false)
    setNewTableName('')
    setNewTableDesc('')
    setCreatingTable(false)
    loadTableDetails(res.table)
  }

  // Handle Delete Table
  async function handleDeleteTable(tableName: string) {
    if (!confirm(`Delete table "${tableName}" and all its records?`)) return

    startTransition(async () => {
      await deleteTable(projectId, tableName)
      const filtered = tables.filter((t) => t.name !== tableName)
      setTables(filtered)
      if (selectedTable?.name === tableName) {
        if (filtered[0]) {
          loadTableDetails(filtered[0])
        } else {
          setSelectedTable(null)
          setColumns([])
          setRecords([])
        }
      }
    })
  }

  // Handle Add Column row in modal
  function addCustomCol() {
    setCustomCols([...customCols, { name: '', data_type: 'text', is_nullable: true }])
  }

  function removeCustomCol(index: number) {
    setCustomCols(customCols.filter((_, i) => i !== index))
  }

  // Handle Insert Record
  async function handleInsertRecord(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTable) return

    setInsertingRow(true)
    const formattedData: Record<string, any> = {}

    columns.forEach((col) => {
      if (col.name === 'id') return
      const val = newRowData[col.name]
      if (val !== undefined && val !== '') {
        if (col.data_type === 'integer' || col.data_type === 'numeric') {
          formattedData[col.name] = Number(val)
        } else if (col.data_type === 'boolean') {
          formattedData[col.name] = val === 'true'
        } else if (col.data_type === 'jsonb') {
          try {
            formattedData[col.name] = JSON.parse(val)
          } catch {
            formattedData[col.name] = val
          }
        } else {
          formattedData[col.name] = val
        }
      }
    })

    const res = await insertRecord(projectId, selectedTable.name, formattedData)
    if (res.record) {
      setRecords([res.record, ...records])
      setInsertRecordModal(false)
      setNewRowData({})
    }
    setInsertingRow(false)
  }

  // Handle Delete Record
  async function handleDeleteRecord(recordId: string) {
    if (!selectedTable || !confirm('Delete this record?')) return
    await deleteRecord(projectId, selectedTable.name, recordId)
    setRecords(records.filter((r) => r.id !== recordId))
  }

  // GenAI Ask Database
  async function handleAskAI(e: React.FormEvent) {
    e.preventDefault()
    if (!aiPrompt.trim()) return

    setAiLoading(true)
    setAiResult(null)
    setIsPinnedNow(false)

    try {
      const res = await askDatabaseAI(projectId, aiPrompt)
      if (res.analysis) {
        setAiResult(res.analysis)
      } else {
        alert(res.error || 'AI analysis could not be completed.')
      }
    } finally {
      setAiLoading(false)
    }
  }

  // Pin Current AI Info Card
  async function handlePinCard() {
    if (!aiResult || !aiPrompt) return
    setPinning(true)

    const res = await pinInfoCard(
      projectId,
      aiResult.title,
      aiPrompt,
      aiResult.summary,
      aiResult.metric
    )

    if (res.card) {
      setPinnedCards([res.card, ...pinnedCards])
      setIsPinnedNow(true)
    }
    setPinning(false)
  }

  // Delete Pinned Card
  async function handleDeletePinnedCard(cardId: string) {
    await deletePinnedCard(projectId, cardId)
    setPinnedCards(pinnedCards.filter((c) => c.id !== cardId))
  }

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Database & GenAI Intelligence</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Relational tables, schema management, and natural language analytics powered by Gemini.
          </p>
        </div>

        <button
          onClick={() => setCreateTableModal(true)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Table
        </button>
      </div>

      {/* ─── GenAI Database Intelligence & Live Info Cards ─── */}
      <section className="rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/[0.06] via-white/[0.01] to-transparent p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              GenAI Database Assistant
            </h2>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Model: gemini-2.5-flash</span>
        </div>

        {/* Query Input Form */}
        <form onSubmit={handleAskAI} className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask a question from your database (e.g. 'How many active users exist?' or 'Summarize pending tasks')"
            className="flex-1 bg-[#08080a] border border-white/[0.08] rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={aiLoading || !aiPrompt.trim()}
            className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-medium text-white transition-colors shrink-0"
          >
            {aiLoading ? 'Analyzing...' : 'Ask AI'}
          </button>
        </form>

        {/* AI Answer Card Result */}
        {aiResult && (
          <div className="rounded-lg border border-indigo-500/40 bg-[#0c0c12] p-4 space-y-3 animate-fadeInUp">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs text-indigo-400 font-medium block">{aiResult.title}</span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">{aiResult.metric}</h3>
              </div>

              {/* Pin as Live Info Card Checkbox / Action */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePinCard}
                  disabled={pinning || isPinnedNow}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                    isPinnedNow
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white'
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>{isPinnedNow ? 'Pinned as Live Card' : 'Pin as Info Card'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed border-t border-white/[0.06] pt-2.5">
              {aiResult.summary}
            </p>
          </div>
        )}

        {/* Pinned Info Cards Grid */}
        {pinnedCards.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Pinned Live Info Cards ({pinnedCards.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pinnedCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-lg border border-white/[0.08] bg-[#0a0a0f] p-3.5 space-y-2 hover:border-indigo-500/30 transition-all relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-zinc-300 truncate">{card.title}</span>
                    <button
                      onClick={() => handleDeletePinnedCard(card.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Unpin card"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {card.result_metric && (
                    <div className="text-base font-bold text-indigo-400 tracking-tight">
                      {card.result_metric}
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3">
                    {card.result_summary}
                  </p>

                  <div className="text-[10px] font-mono text-zinc-600 pt-1 border-t border-white/[0.04]">
                    Query: "{card.natural_query}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ─── Database Tables & Data Browser ─── */}
      <div className="space-y-4">
        {/* Table Selector Tabs */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {tables.map((t) => (
              <button
                key={t.id}
                onClick={() => loadTableDetails(t)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTable?.id === t.id
                    ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <span>{t.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteTable(t.name)
                  }}
                  className="text-zinc-600 hover:text-red-400"
                  title="Delete table"
                >
                  ×
                </button>
              </button>
            ))}
          </div>

          {selectedTable && (
            <button
              onClick={() => setInsertRecordModal(true)}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-white/[0.08] hover:bg-white/[0.12] text-xs font-medium text-zinc-200 transition-colors shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Insert Row
            </button>
          )}
        </div>

        {/* Selected Table Data Table */}
        {selectedTable ? (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            {loadingData ? (
              <div className="py-16 text-center text-xs text-zinc-500">Loading table schema & records...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02] text-zinc-400 font-medium">
                      <th className="py-2.5 px-3">id (UUID)</th>
                      {columns.filter((c) => c.name !== 'id').map((col) => (
                        <th key={col.name} className="py-2.5 px-3">
                          <span className="text-zinc-300 font-semibold">{col.name}</span>{' '}
                          <span className="text-[10px] font-mono text-zinc-500">({col.data_type})</span>
                        </th>
                      ))}
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length + 1} className="py-12 text-center text-zinc-500 text-xs">
                          No records in table "{selectedTable.name}". Click "Insert Row" to add your first record.
                        </td>
                      </tr>
                    ) : (
                      records.map((r) => (
                        <tr key={r.id} className="hover:bg-white/[0.02] text-zinc-300">
                          <td className="py-2.5 px-3 font-mono text-zinc-500 text-[11px]">
                            {r.id.slice(0, 8)}...
                          </td>
                          {columns.filter((c) => c.name !== 'id').map((col) => {
                            const val = r.data?.[col.name]
                            const display = typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'null')
                            return (
                              <td key={col.name} className="py-2.5 px-3 truncate max-w-xs font-mono text-zinc-300">
                                {display}
                              </td>
                            )
                          })}
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteRecord(r.id)}
                              className="text-zinc-600 hover:text-red-400 p-1"
                              title="Delete record"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/[0.08] p-16 text-center text-zinc-500 text-xs">
            No database tables created yet. Click "New Table" to define your schema.
          </div>
        )}
      </div>

      {/* ─── SDK Query Builder Example Snippet ─── */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-5 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Query Builder Integration (SDK)
        </h3>
        <p className="text-xs text-zinc-500">
          Client code safely queries tables through parameterized operations without raw SQL vulnerabilities.
        </p>
        <pre className="text-xs font-mono text-zinc-300 bg-[#08080a] p-4 rounded-lg overflow-x-auto leading-relaxed border border-white/[0.05]">
{`// 1. Safe query builder with filters
const { data, error } = await zorabase
  .from('${selectedTable?.name || 'users'}')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(20)

// 2. Insert new record
const { data: created } = await zorabase
  .from('${selectedTable?.name || 'users'}')
  .insert({ name: 'Alice', email: 'alice@example.com' })`}
        </pre>
      </div>

      {/* ─── Modal: Create New Table ─── */}
      {createTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreateTableModal(false)} />
          <div className="relative w-full max-w-lg bg-[#111113] border border-white/[0.08] rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-zinc-100">Create Table</h2>
              <button onClick={() => setCreateTableModal(false)} className="text-zinc-500 hover:text-zinc-300">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Table Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. users, tasks, orders"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Stores customer profiles"
                  value={newTableDesc}
                  onChange={(e) => setNewTableDesc(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Columns Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">Columns (id is auto-created)</span>
                  <button
                    type="button"
                    onClick={addCustomCol}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    + Add Column
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {customCols.map((col, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Column name"
                        value={col.name}
                        onChange={(e) => {
                          const updated = [...customCols]
                          updated[idx].name = e.target.value
                          setCustomCols(updated)
                        }}
                        className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none"
                      />
                      <select
                        value={col.data_type}
                        onChange={(e) => {
                          const updated = [...customCols]
                          updated[idx].data_type = e.target.value
                          setCustomCols(updated)
                        }}
                        className="bg-[#0c0c12] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 outline-none"
                      >
                        {SUPPORTED_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeCustomCol(idx)}
                        className="text-zinc-600 hover:text-red-400 px-1 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {tableError && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-2.5">
                  {tableError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateTableModal(false)}
                  className="flex-1 h-9 rounded-lg border border-white/[0.08] text-xs font-medium text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTable}
                  className="flex-1 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-medium text-white"
                >
                  {creatingTable ? 'Creating...' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Insert Record ─── */}
      {insertRecordModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInsertRecordModal(false)} />
          <div className="relative w-full max-w-md bg-[#111113] border border-white/[0.08] rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-zinc-100">Insert Row into {selectedTable.name}</h2>
              <button onClick={() => setInsertRecordModal(false)} className="text-zinc-500 hover:text-zinc-300">
                ×
              </button>
            </div>

            <form onSubmit={handleInsertRecord} className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {columns.filter((c) => c.name !== 'id').map((col) => (
                <div key={col.name}>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    {col.name} <span className="text-zinc-600 font-mono text-[10px]">({col.data_type})</span>
                  </label>
                  <input
                    type="text"
                    value={newRowData[col.name] || ''}
                    onChange={(e) => setNewRowData({ ...newRowData, [col.name]: e.target.value })}
                    placeholder={`Enter ${col.data_type} value`}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-indigo-500/50"
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setInsertRecordModal(false)}
                  className="flex-1 h-9 rounded-lg border border-white/[0.08] text-xs font-medium text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={insertingRow}
                  className="flex-1 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-medium text-white"
                >
                  {insertingRow ? 'Inserting...' : 'Insert Row'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
