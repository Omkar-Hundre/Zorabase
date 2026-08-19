import { notFound } from 'next/navigation'
import { getProject } from '@/app/dashboard/actions'
import { listBuckets, checkStorageHealth } from './actions'
import StorageView from '@/components/dashboard/StorageView'

export default async function StoragePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) notFound()

  const [buckets, s3Health] = await Promise.all([
    listBuckets(projectId),
    checkStorageHealth(),
  ])

  return (
    <StorageView
      projectId={projectId}
      initialBuckets={buckets}
      s3Health={s3Health}
    />
  )
}
