import { RealtimeCallback, RealtimeEventType, RealtimeSubscription } from './types'

export class RealtimeChannel {
  private url: string
  private apiKey: string
  private channelName: string
  private listeners: Map<RealtimeEventType, RealtimeCallback[]> = new Map()
  private eventSource: any = null

  constructor(url: string, apiKey: string, channelName: string) {
    this.url = url.replace(/\/$/, '')
    this.apiKey = apiKey
    this.channelName = channelName
  }

  on(event: RealtimeEventType, callback: RealtimeCallback): this {
    const list = this.listeners.get(event) || []
    list.push(callback)
    this.listeners.set(event, list)
    return this
  }

  subscribe(): RealtimeSubscription {
    if (typeof EventSource !== 'undefined') {
      const streamUrl = `${this.url}/realtime?channel=${encodeURIComponent(this.channelName)}&apikey=${encodeURIComponent(this.apiKey)}`
      const es = new EventSource(streamUrl)
      this.eventSource = es

      es.addEventListener('message', (e) => {
        try {
          const parsed = JSON.parse(e.data)
          const eventType = parsed.event as RealtimeEventType

          // Notify exact event listeners
          const directListeners = this.listeners.get(eventType) || []
          directListeners.forEach((cb) => cb(parsed.payload))

          // Notify wildcard listeners
          const wildcardListeners = this.listeners.get('*') || []
          wildcardListeners.forEach((cb) => cb(parsed.payload))
        } catch (err) {
          console.error('[Zorabase Realtime SSE Parse Error]', err)
        }
      })
    }

    return {
      unsubscribe: () => {
        if (this.eventSource) {
          this.eventSource.close()
          this.eventSource = null
        }
        this.listeners.clear()
      },
    }
  }
}
