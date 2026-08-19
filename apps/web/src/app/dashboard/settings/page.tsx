import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAccountSettings, getRecentAuditLogs } from './actions'
import SettingsView from '@/components/dashboard/SettingsView'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [settings, logs] = await Promise.all([
    getAccountSettings(),
    getRecentAuditLogs(),
  ])

  return (
    <SettingsView
      initialSettings={settings}
      userEmail={user.email || ''}
      userId={user.id}
      recentLogs={logs}
    />
  )
}
