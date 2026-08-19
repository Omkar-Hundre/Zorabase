import { ApiResponse, FilterCondition, QueryOptions } from './types'

export class QueryBuilder<T = Record<string, any>> {
  private url: string
  private apiKey: string
  private tableName: string
  private options: QueryOptions = {
    filters: [],
  }

  constructor(url: string, apiKey: string, tableName: string) {
    this.url = url.replace(/\/$/, '')
    this.apiKey = apiKey
    this.tableName = tableName
  }

  select(columns: string = '*'): this {
    this.options.select = columns
    return this
  }

  eq(column: string, value: any): this {
    this.options.filters.push({ column, operator: 'eq', value })
    return this
  }

  neq(column: string, value: any): this {
    this.options.filters.push({ column, operator: 'neq', value })
    return this
  }

  gt(column: string, value: any): this {
    this.options.filters.push({ column, operator: 'gt', value })
    return this
  }

  gte(column: string, value: any): this {
    this.options.filters.push({ column, operator: 'gte', value })
    return this
  }

  lt(column: string, value: any): this {
    this.options.filters.push({ column, operator: 'lt', value })
    return this
  }

  lte(column: string, value: any): this {
    this.options.filters.push({ column, operator: 'lte', value })
    return this
  }

  order(column: string, { ascending = true }: { ascending?: boolean } = {}): this {
    this.options.order = { column, ascending }
    return this
  }

  limit(count: number): this {
    this.options.limit = count
    return this
  }

  offset(count: number): this {
    this.options.offset = count
    return this
  }

  private buildQueryString(): string {
    const params = new URLSearchParams()
    if (this.options.select) params.append('select', this.options.select)
    if (this.options.limit) params.append('limit', String(this.options.limit))
    if (this.options.offset) params.append('offset', String(this.options.offset))
    if (this.options.order) {
      params.append('order', `${this.options.order.column}.${this.options.order.ascending ? 'asc' : 'desc'}`)
    }

    this.options.filters.forEach((f) => {
      params.append(f.column, `${f.operator}.${f.value}`)
    })

    const str = params.toString()
    return str ? `?${str}` : ''
  }

  async get(): Promise<ApiResponse<T[]>> {
    try {
      const endpoint = `${this.url}/data/${this.tableName}${this.buildQueryString()}`
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
      })
      const json = await res.json()
      if (!res.ok) {
        return { data: null, error: json.error || { code: 'API_ERROR', message: res.statusText } }
      }
      return { data: json.data, error: null }
    } catch (err: any) {
      return { data: null, error: { code: 'NETWORK_ERROR', message: err.message || 'Fetch failed' } }
    }
  }

  async single(): Promise<ApiResponse<T>> {
    this.limit(1)
    const res = await this.get()
    if (res.error) return { data: null, error: res.error }
    return { data: res.data?.[0] || null, error: null }
  }

  async insert(record: Partial<T> | Partial<T>[]): Promise<ApiResponse<T | T[]>> {
    try {
      const endpoint = `${this.url}/data/${this.tableName}`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      })
      const json = await res.json()
      if (!res.ok) {
        return { data: null, error: json.error || { code: 'INSERT_ERROR', message: res.statusText } }
      }
      return { data: json.data, error: null }
    } catch (err: any) {
      return { data: null, error: { code: 'NETWORK_ERROR', message: err.message } }
    }
  }

  async update(updates: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const endpoint = `${this.url}/data/${this.tableName}${this.buildQueryString()}`
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      const json = await res.json()
      if (!res.ok) {
        return { data: null, error: json.error || { code: 'UPDATE_ERROR', message: res.statusText } }
      }
      return { data: json.data, error: null }
    } catch (err: any) {
      return { data: null, error: { code: 'NETWORK_ERROR', message: err.message } }
    }
  }

  async delete(): Promise<ApiResponse<{ count: number }>> {
    try {
      const endpoint = `${this.url}/data/${this.tableName}${this.buildQueryString()}`
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
      })
      const json = await res.json()
      if (!res.ok) {
        return { data: null, error: json.error || { code: 'DELETE_ERROR', message: res.statusText } }
      }
      return { data: json.data, error: null }
    } catch (err: any) {
      return { data: null, error: { code: 'NETWORK_ERROR', message: err.message } }
    }
  }

  /* Thenable implementation for `const { data } = await db.from('users').select('*')` */
  then<TResult1 = ApiResponse<T[]>, TResult2 = never>(
    onfulfilled?: ((value: ApiResponse<T[]>) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected)
  }
}
