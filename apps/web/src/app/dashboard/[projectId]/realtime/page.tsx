import { notFound } from 'next/navigation'
import { getProject, getProjectKeys } from '@/app/dashboard/actions'
import { listTables } from '../database/actions'
import RealtimeView from '@/components/dashboard/RealtimeView'

export default async function RealtimePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const [project, keys, tables] = await Promise.all([
    getProject(projectId),
    getProjectKeys(projectId),
    listTables(projectId),
  ])

  if (!project) notFound()

  const publicKey = keys.find((k) => k.type === 'public')?.key_value || null

  return (
    <RealtimeView
      project={project}
      publicKey={publicKey}
      initialTables={tables.map((t) => ({ id: t.id, name: t.name }))}
    />
  )
}
