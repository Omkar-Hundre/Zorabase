import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProjectShell from '@/components/dashboard/ProjectShell'
import { getProject } from '@/app/dashboard/actions'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const project = await getProject(projectId)
  if (!project) notFound()

  return (
    <ProjectShell project={project}>
      {children}
    </ProjectShell>
  )
}
