'use client'

import { useState } from 'react'
import {
  type AccountSettings,
  type AuditLog,
  updateAccountSettings,
  purgeProjectCache,
} from '@/app/dashboard/settings/actions'
import { signOut } from '@/app/auth/actions'

interface Props {
  initialSettings: AccountSettings
  userEmail: string
  userId: string
  recentLogs: AuditLog[]
}

export default function SettingsView({
  initialSettings,
  userEmail,
  userId,
  recentLogs: initialLogs,
}: Props) {
  const [settings, setSettings] = useState<AccountSettings>(initialSettings)
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [purging, setPurging] = useState(false)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToastMessage(msg)
    setToastType(type)
    setTimeout(() => setToastMessage(null), 3000)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const res = await updateAccountSettings(formData)

    if (res.error) {
      showToast(res.error, 'error')
    } else {
      showToast('Settings saved successfully!')
      // Update local state
      setSettings((prev) => ({
        ...prev,
        display_name: formData.get('displayName') as string,
        ai_model: formData.get('aiModel') as string,
        ai_system_instructions: formData.get('aiInstructions') as string,
        cors_allowed_origins: formData.get('corsOrigins') as string,
        max_upload_size_mb: Number(formData.get('maxUploadSize')),
        rate_limit_rpm: Number(formData.get('rateLimit')),
        session_expiry_hours: Number(formData.get('sessionExpiry')),
      }))
    }
    setSaving(false)
  }

  async function handlePurgeCache() {
    if (!confirm('Purge all cached database metadata and temporary query buffers?')) return
    setPurging(true)
    const res = await purgeProjectCache()
    showToast(res.message, res.success ? 'success' : 'error')
    setPurging(false)
  }

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg text-xs font-medium border shadow-2xl flex items-center gap-2 animate-fadeInUp ${
            toastType === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Account & Platform Settings</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Configure developer identity, GenAI analyst prompts, CORS security policies, and S3 upload thresholds.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Profile & AI Configuration (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Developer Profile Card */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Developer Profile</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    defaultValue={settings.display_name || ''}
                    placeholder="Jane Doe"
                    className="w-full bg-[#08080a] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="w-full bg-[#08080a] border border-white/[0.05] rounded-lg px-3 py-2 text-zinc-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium text-xs">Developer Account ID</label>
                <code className="block w-full bg-[#08080a] border border-white/[0.06] rounded-lg px-3 py-1.5 text-zinc-400 font-mono text-[11px] select-all">
                  {userId}
                </code>
              </div>
            </div>

            {/* GenAI Settings & Custom System Prompt */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    GenAI Database Assistant Configuration
                  </h2>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Powered by Google Gemini</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Active Gemini Model</label>
                  <select
                    name="aiModel"
                    defaultValue={settings.ai_model}
                    className="w-full bg-[#08080a] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-indigo-500/50"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended: Ultra-fast & High Precision)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Complex Analytical Reasoning)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">
                    AI Analyst System Instructions (Schema Context Guiding)
                  </label>
                  <textarea
                    rows={3}
                    name="aiInstructions"
                    defaultValue={settings.ai_system_instructions || ''}
                    placeholder="Custom rules for how the AI parses and summarizes your database tables..."
                    className="w-full bg-[#08080a] border border-white/[0.08] rounded-lg p-3 text-zinc-200 outline-none focus:border-indigo-500/50 font-mono text-xs leading-relaxed"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    These instructions are injected into every natural language query prompt to format responses to your business domain.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Security, S3 Limits & Save Button (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Security, CORS & Rate Limiting */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                  Security & Network Policies
                </h2>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Allowed CORS Origins</label>
                  <input
                    type="text"
                    name="corsOrigins"
                    defaultValue={settings.cors_allowed_origins}
                    placeholder="* or https://app.example.com, http://localhost:3000"
                    className="w-full bg-[#08080a] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 font-mono text-xs outline-none focus:border-indigo-500/50"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Comma-separated domains permitted to invoke REST and Storage APIs. Use <code className="text-zinc-400 font-mono">*</code> for public access.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Rate Limit (Req/min)</label>
                    <input
                      type="number"
                      name="rateLimit"
                      defaultValue={settings.rate_limit_rpm}
                      min={10}
                      max={10000}
                      className="w-full bg-[#08080a] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Max S3 File (MB)</label>
                    <input
                      type="number"
                      name="maxUploadSize"
                      defaultValue={settings.max_upload_size_mb}
                      min={1}
                      max={5000}
                      className="w-full bg-[#08080a] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Session Inactivity Timeout (Hours)</label>
                  <input
                    type="number"
                    name="sessionExpiry"
                    defaultValue={settings.session_expiry_hours}
                    min={1}
                    max={720}
                    className="w-full bg-[#08080a] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Save Action */}
            <div className="rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent p-4 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Save changes to live database configuration</span>
              <button
                type="submit"
                disabled={saving}
                className="h-9 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-medium text-white transition-colors"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] p-5 space-y-3">
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Maintenance & Danger Zone</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Purge schema caches or sign out of your developer session across all devices.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePurgeCache}
                  disabled={purging}
                  className="flex-1 h-8 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-xs font-medium text-zinc-300 transition-colors"
                >
                  {purging ? 'Purging...' : 'Purge Schema Cache'}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut()
                  }}
                  className="flex-1 h-8 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-300 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Security & Activity Audit Log Stream */}
      <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Security & Activity Audit Logs
            </h2>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Immutable Compliance Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-500 font-medium">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Resource</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No security events logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] text-zinc-300">
                    <td className="py-2.5 px-3 text-zinc-500">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-indigo-300">{log.action}</td>
                    <td className="py-2.5 px-3 text-zinc-400">{log.resource}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.2 rounded">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-500">{log.latency_ms} ms</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
