export interface ZorabaseClientOptions {
  url: string
  apiKey: string
  headers?: Record<string, string>
}

export interface ApiResponse<T> {
  data: T | null
  error: { code: string; message: string } | null
}

export interface FilterCondition {
  column: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in'
  value: any
}

export interface QueryOptions {
  select?: string
  order?: { column: string; ascending?: boolean }
  limit?: number
  offset?: number
  filters: FilterCondition[]
}

export interface StorageUploadOptions {
  contentType?: string
  upsert?: boolean
}

export interface StorageSignedUrlResponse {
  signedUrl: string
  expiresAt: number
}

export interface RealtimeSubscription {
  unsubscribe: () => void
}

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*'
export type RealtimeCallback<T = any> = (payload: {
  event: RealtimeEventType
  new: T
  old?: T
}) => void
