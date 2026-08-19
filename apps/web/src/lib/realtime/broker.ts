import { EventEmitter } from 'events'

export interface RealtimeEvent<T = any> {
  id: string
  projectId: string
  channel: string
  event: 'INSERT' | 'UPDATE' | 'DELETE' | 'BROADCAST'
  payload: {
    new?: T
    old?: T
    data?: any
  }
  timestamp: string
}

export interface RealtimeBroker {
  publish(event: RealtimeEvent): Promise<void>
  subscribe(projectId: string, channel: string, listener: (event: RealtimeEvent) => void): () => void
}

class InMemoryRealtimeBroker implements RealtimeBroker {
  private emitter = new EventEmitter()

  constructor() {
    this.emitter.setMaxListeners(200)
  }

  async publish(event: RealtimeEvent): Promise<void> {
    const key = `${event.projectId}:${event.channel}`
    const wildcardKey = `${event.projectId}:*`

    this.emitter.emit(key, event)
    this.emitter.emit(wildcardKey, event)
  }

  subscribe(projectId: string, channel: string, listener: (event: RealtimeEvent) => void): () => void {
    const key = `${projectId}:${channel}`
    this.emitter.on(key, listener)

    return () => {
      this.emitter.off(key, listener)
    }
  }
}

// Global broker singleton
declare global {
  var __zorabase_realtime_broker: InMemoryRealtimeBroker | undefined
}

export const realtimeBroker: InMemoryRealtimeBroker =
  globalThis.__zorabase_realtime_broker || new InMemoryRealtimeBroker()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__zorabase_realtime_broker = realtimeBroker
}

export function createRealtimeEvent<T = any>({
  projectId,
  channel,
  event,
  newData,
  oldData,
}: {
  projectId: string
  channel: string
  event: 'INSERT' | 'UPDATE' | 'DELETE' | 'BROADCAST'
  newData?: T
  oldData?: T
}): RealtimeEvent<T> {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    projectId,
    channel,
    event,
    payload: {
      new: newData,
      old: oldData,
      data: newData,
    },
    timestamp: new Date().toISOString(),
  }
}
