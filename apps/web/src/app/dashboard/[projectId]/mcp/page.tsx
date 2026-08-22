import { notFound } from 'next/navigation'
import { getProject, getProjectKeys } from '@/app/dashboard/actions'
import McpPageClient from './McpPageClient'

export default async function McpPage({
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
  const projectUrl = `${process.env.NEXT_PUBLIC_API_URL ?? 'https://api.zorabase.io/v1'}/proj_${project.id}`

  return (
    <McpPageClient
      projectName={project.name}
      projectUrl={projectUrl}
      apiKey={publicKey?.key_value ?? 'zb_anon_••••••••••••'}
    />
  )
}
