import { QueryBuilder } from './database'
import { StorageClient } from './storage'
import { AuthClient } from './auth'
import { RealtimeChannel } from './realtime'
import { ZorabaseClientOptions } from './types'

export class ZorabaseClient {
  public auth: AuthClient
  public storage: StorageClient
  private url: string
  private apiKey: string

  constructor(options: ZorabaseClientOptions) {
    if (!options.url) {
      throw new Error('ZorabaseClient requires a valid "url"')
    }
    if (!options.apiKey) {
      throw new Error('ZorabaseClient requires a valid "apiKey"')
    }

    this.url = options.url.replace(/\/$/, '')
    this.apiKey = options.apiKey

    this.auth = new AuthClient(this.url, this.apiKey)
    this.storage = new StorageClient(this.url, this.apiKey)
  }

  from<T = Record<string, any>>(table: string): QueryBuilder<T> {
    return new QueryBuilder<T>(this.url, this.apiKey, table)
  }

  channel(name: string): RealtimeChannel {
    return new RealtimeChannel(this.url, this.apiKey, name)
  }
}

export function createClient(options: ZorabaseClientOptions): ZorabaseClient {
  return new ZorabaseClient(options)
}
