'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signUp } from '@/app/auth/actions'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)

    const password = formData.get('password') as string
    const confirm = formData.get('confirmPassword') as string

    if (password !== confirm) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const result = await signUp(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#030303] text-[#f8f9fa] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(32,54,101,0.35) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 w-full max-w-[420px] text-center space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-[#09090d]/90 backdrop-blur-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(32,54,101,0.2)] space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              ✉️
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">Check your email</h1>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                {success}
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-[#203665] hover:bg-[#2a4580] text-sm font-semibold text-white transition-all shadow-[0_0_20px_rgba(32,54,101,0.5)] border border-sky-400/30"
            >
              Go to Sign In →
            </Link>
          </div>
        </div>
      </div>
    )
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
            radial-gradient(ellipse 50% 40% at 20% 80%, rgba(32,54,101,0.12) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-[440px] space-y-6">
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
              Create your account
            </h1>
            <p className="text-sm text-slate-400 font-light">
              Start building high-speed backends with Zorabase
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5">
              <span className="text-sm shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Full name
              </label>
              <input
                id="register-name"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                className="w-full px-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.1] focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 text-sm text-white placeholder-slate-500 outline-none transition-all"
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Email address
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.1] focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 text-sm text-white placeholder-slate-500 outline-none transition-all"
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full px-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.1] focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 text-sm text-white placeholder-slate-500 outline-none transition-all"
                placeholder="At least 8 characters"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Confirm password
              </label>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.1] focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40 text-sm text-white placeholder-slate-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-11 rounded-xl bg-[#203665] hover:bg-[#2a4580] text-sm font-semibold text-white transition-all shadow-[0_0_20px_rgba(32,54,101,0.5)] border border-sky-400/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account →'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center space-y-3">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              By continuing, you agree to the Zorabase terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
