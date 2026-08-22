'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signIn } from '@/app/auth/actions'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await signIn(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] text-[#f8f9fa] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Radial Glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(32,54,101,0.35) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(32,54,101,0.12) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] space-y-6">
        {/* Typographic Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-1 group">
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
              Zorabase
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          </Link>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#09090d]/90 backdrop-blur-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(32,54,101,0.2)]">
          <div className="space-y-1 mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-sm text-slate-400 font-light">
              Sign in to your Zorabase project console
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5">
              <span className="text-sm shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.1] focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 text-sm text-white placeholder-slate-500 outline-none transition-all"
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.1] focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 text-sm text-white placeholder-slate-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-11 rounded-xl bg-[#203665] hover:bg-[#2a4580] text-sm font-semibold text-white transition-all shadow-[0_0_20px_rgba(32,54,101,0.5)] border border-sky-400/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
