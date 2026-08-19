'use client'

import { useState, useEffect } from 'react'
import { type Project } from '@/app/dashboard/actions'
import { createClient } from '@/lib/supabase/client'

interface Props {
  project: Project
  publicKey: string | null
  initialTables: Array<{ id: string; name: string }>
}

interface StreamEvent {
  id: string
  channel: string
  event: string
  payload: any
  timestamp: string
}

export default function RealtimeView({ project, publicKey, initialTables }: Props) {
  const [selectedTableFilter, setSelectedTableFilter] = useState<string>('*')
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'idle'>('connecting')

  // Simulation form
  const [simChannel, setSimChannel] = useState(initialTables[0]?.name || 'messages')
  const [simEvent, setSimEvent] = useState<'INSERT' | 'UPDATE' | 'DELETE' | 'BROADCAST'>('INSERT')
  const [simPayload, setSimPayload] = useState('{\n  "title": "Realtime notification",\n  "status": "delivered"\n}')
  const [simulating, setSimulating] = useState(false)

  // Supabase Realtime WebSocket Connection
  useEffect(() => {
    const supabase = createClient()
    setConnectionStatus('connecting')

    const channelName = `zorabase-${project.id}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'platform',
          table: 'database_records',
          filter: `project_id=eq.${project.id}`,
        },
        (payload: any) => {
          const tableName = payload.new?.table_name || payload.old?.table_name || 'database'
          
          if (selectedTableFilter !== '*' && tableName !== selectedTableFilter) {
            return
          }

          const streamEvt: StreamEvent = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            channel: tableName,
            event: payload.eventType,
            payload: {
              new: payload.new?.data ? { id: payload.new.id, ...payload.new.data } : payload.new,
              old: payload.old?.data ? { id: payload.old.id, ...payload.old.data } : payload.old,
            },
            timestamp: new Date().toISOString(),
          }

          setEvents((prev) => [streamEvt, ...prev.slice(0, 99)])
        }
      )
      .on('broadcast', { event: '*' }, (payload: any) => {
        const streamEvt: StreamEvent = {
          id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          channel: payload.payload?.channel || 'broadcast',
          event: payload.event || 'BROADCAST',
          payload: payload.payload || {},
          timestamp: new Date().toISOString(),
        }
        setEvents((prev) => [streamEvt, ...prev.slice(0, 99)])
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true)
          setConnectionStatus('connected')
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnected(false)
          setConnectionStatus('error')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [project.id, selectedTableFilter])

  // Handle Manual Simulation Broadcast
  async function handlePublishEvent(e: React.FormEvent) {
    e.preventDefault()
    setSimulating(true)

    try {
      let parsedPayload = {}
      try {
        parsedPayload = JSON.parse(simPayload)
      } catch {
        alert('Payload must be valid JSON')
        setSimulating(false)
        return
      }

      const supabase = createClient()
      const channel = supabase.channel(`zorabase-${project.id}`)
      
      await channel.send({
        type: 'broadcast',
        event: simEvent,
        payload: {
          channel: simChannel,
          ...parsedPayload,
        },
      })
    } catch (err: any) {
      alert(`Publish failed: ${err.message}`)
    } finally {
      setSimulating(false)
    }
  }

  function clearEvents() {
    setEvents([])
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Realtime Engine & WebSocket Stream</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Live mutation events and broadcast channels powered by PostgreSQL CDC replication.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connected
                  ? 'bg-emerald-400 animate-pulse'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-400'
                  : 'bg-red-400'
              }`}
            />
            <span className="font-mono text-zinc-300 text-[11px]">
              {connected ? 'WebSocket Connected (Live)' : connectionStatus === 'connecting' ? 'Connecting WebSocket...' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Event Stream (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-4">
            {/* Filter / Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Filter Table:</span>
                <select
                  value={selectedTableFilter}
                  onChange={(e) => setSelectedTableFilter(e.target.value)}
                  className="bg-[#08080a] border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-zinc-200 outline-none focus:border-indigo-500/50"
                >
                  <option value="*">* (All tables & broadcasts)</option>
                  {initialTables.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-500 font-mono">
                  {events.length} event{events.length === 1 ? '' : 's'}
                </span>
                <button
                  onClick={clearEvents}
                  className="px-2.5 py-1 rounded text-[11px] font-medium text-zinc-400 hover:text-zinc-200 border border-white/[0.08] hover:bg-white/[0.05] transition-all"
                >
                  Clear Feed
                </button>
              </div>
            </div>

            {/* Event List / Feed */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {events.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-white/[0.06] rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-2 text-zinc-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-zinc-400">Listening for live events...</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    Insert or update rows in the Database tab or broadcast a test event on the right.
                  </p>
                </div>
              ) : (
                events.map((evt) => {
                  const eventTime = new Date(evt.timestamp).toLocaleTimeString()
                  const isInsert = evt.event === 'INSERT'
                  const isUpdate = evt.event === 'UPDATE'
                  const isDelete = evt.event === 'DELETE'

                  return (
                    <div
                      key={evt.id}
                      className="rounded-lg border border-white/[0.08] bg-[#09090d] p-3.5 space-y-2 transition-all hover:border-indigo-500/30"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              isInsert
                                ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'
                                : isUpdate
                                ? 'text-indigo-400 border-indigo-400/20 bg-indigo-400/10'
                                : isDelete
                                ? 'text-red-400 border-red-400/20 bg-red-400/10'
                                : 'text-amber-400 border-amber-400/20 bg-amber-400/10'
                            }`}
                          >
                            {evt.event}
                          </span>
                          <span className="font-mono text-zinc-300 text-[11px]">table: {evt.channel}</span>
                        </div>
                        <span className="text-zinc-600 font-mono text-[10px]">{eventTime}</span>
                      </div>

                      <pre className="text-[11px] font-mono text-zinc-400 bg-black/40 p-2.5 rounded overflow-x-auto leading-relaxed border border-white/[0.03]">
                        {JSON.stringify(evt.payload, null, 2)}
                      </pre>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Event Simulator & SDK Snippet (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Test Event Simulator */}
          <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Event Broadcaster & Simulator
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Broadcast custom messages across connected clients via WebSockets.
              </p>
            </div>

            <form onSubmit={handlePublishEvent} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Target Channel</label>
                  <input
                    type="text"
                    required
                    value={simChannel}
                    onChange={(e) => setSimChannel(e.target.value)}
                    placeholder="e.g. users, notifications"
                    className="w-full bg-[#08080a] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Event Name</label>
                  <select
                    value={simEvent}
                    onChange={(e) => setSimEvent(e.target.value as any)}
                    className="w-full bg-[#08080a] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 outline-none focus:border-indigo-500/50"
                  >
                    <option value="INSERT">INSERT</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="DELETE">DELETE</option>
                    <option value="BROADCAST">BROADCAST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Payload (JSON)</label>
                <textarea
                  rows={4}
                  value={simPayload}
                  onChange={(e) => setSimPayload(e.target.value)}
                  className="w-full font-mono text-xs bg-[#08080a] border border-white/[0.08] rounded-lg p-2.5 text-zinc-200 outline-none focus:border-indigo-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={simulating}
                className="w-full h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-medium text-white transition-colors"
              >
                {simulating ? 'Broadcasting...' : 'Broadcast Event'}
              </button>
            </form>
          </section>

          {/* SDK Realtime Integration */}
          <section className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] p-5 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              SDK Realtime Usage
            </h3>
            <p className="text-xs text-zinc-500">
              Subscribe to table changes in React, Next.js, or mobile apps.
            </p>
            <pre className="text-xs font-mono text-zinc-300 bg-[#08080a] p-3.5 rounded-lg overflow-x-auto leading-relaxed border border-white/[0.05]">
{`// Subscribe to live database changes
const channel = zorabase
  .channel('${simChannel || 'users'}')
  .on('INSERT', (payload) => {
    console.log('New row inserted:', payload.new)
  })
  .on('UPDATE', (payload) => {
    console.log('Row updated:', payload.new)
  })
  .on('DELETE', (payload) => {
    console.log('Row deleted:', payload.old)
  })
  .subscribe()

// Clean up on component unmount
channel.unsubscribe()`}
            </pre>
          </section>
        </div>
      </div>
    </div>
  )
}
