import { listProjects } from '@/app/dashboard/actions'
import ProjectsView from '@/components/dashboard/ProjectsView'

export default async function DashboardPage() {
  const projects = await listProjects()

  return (
    <div className="w-full">
      <ProjectsView projects={projects} />
    </div>
  )
}
