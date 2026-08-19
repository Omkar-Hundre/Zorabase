import { notFound } from 'next/navigation'
import { getProject, getProjectKeys } from '@/app/dashboard/actions'
import ProjectOverview from '@/components/dashboard/ProjectOverview'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const [project, keys] = await Promise.all([
    getProject(projectId),
    getProjectKeys(projectId),
  ])

  if (!project) notFound()

  const publicKey = keys.find((k) => k.type === 'public')
  const serverKey = keys.find((k) => k.type === 'server')

  return (
    <ProjectOverview
      project={project}
      publicKeyPreview={publicKey?.key_preview ?? null}
      serverKeyPreview={serverKey?.key_preview ?? null}
    />
  )
}
