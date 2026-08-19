import { ApiResponse } from './types'

export interface User {
  id: string
  email: string
  fullName?: string
}

export interface Session {
  accessToken: string
  refreshToken: string
  user: User
}

export class AuthClient {
  private url: string
  private apiKey: string

  constructor(url: string, apiKey: string) {
    this.url = url.replace(/\/$/, '')
    this.apiKey = apiKey
  }

  async signUp({ email, password, fullName }: { email: string; password: string; fullName?: string }): Promise<ApiResponse<{ user: User }>> {
    try {
      const res = await fetch(`${this.url}/auth/signup`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error || { code: 'SIGNUP_ERROR', message: res.statusText } }
      return { data: json.data, error: null }
    } catch (err: any) {
      return { data: null, error: { code: 'NETWORK_ERROR', message: err.message } }
    }
  }

  async signIn({ email, password }: { email: string; password: string }): Promise<ApiResponse<Session>> {
    try {
      const res = await fetch(`${this.url}/auth/signin`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error || { code: 'SIGNIN_ERROR', message: res.statusText } }
      return { data: json.data, error: null }
    } catch (err: any) {
      return { data: null, error: { code: 'NETWORK_ERROR', message: err.message } }
    }
  }

  async signOut(): Promise<ApiResponse<{ success: boolean }>> {
    return { data: { success: true }, error: null }
  }
}
