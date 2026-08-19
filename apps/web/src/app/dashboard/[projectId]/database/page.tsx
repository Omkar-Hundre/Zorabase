import { notFound } from 'next/navigation'
import { getProject } from '@/app/dashboard/actions'
import { listTables, listPinnedInfoCards } from './actions'
import DatabaseView from '@/components/dashboard/DatabaseView'

export default async function DatabasePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) notFound()

  const [tables, pinnedCards] = await Promise.all([
    listTables(projectId),
    listPinnedInfoCards(projectId),
  ])

  return (
    <DatabaseView
      projectId={projectId}
      initialTables={tables}
      initialPinnedCards={pinnedCards}
    />
  )
}
