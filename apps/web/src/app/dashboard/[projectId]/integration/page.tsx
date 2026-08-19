import { notFound } from 'next/navigation'
import { getProject, getProjectKeys } from '@/app/dashboard/actions'
import IntegrationView from '@/components/dashboard/IntegrationView'

export default async function IntegrationPage({
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

  const publicKeyObj = keys.find((k) => k.type === 'public')
  const serverKeyObj = keys.find((k) => k.type === 'server')

  return (
    <IntegrationView
      project={project}
      publicKey={publicKeyObj?.key_value ?? null}
      serverKeyPreview={serverKeyObj?.key_preview ?? null}
    />
  )
}
