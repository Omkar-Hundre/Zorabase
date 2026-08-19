'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateProjectId, generatePublicKey, generateServerKey } from '@/lib/keys'

export type Project = {
  id: string
  name: string
  owner_id: string
  status: string
  created_at: string
}

export type ApiKey = {
  id: string
  project_id: string
  type: 'public' | 'server'
  key_value: string
  key_preview: string
  is_active: boolean
  created_at: string
}

export type CreateProjectResult =
  | { project: Project; publicKey: string; serverKey: string; error?: never }
  | { error: string; project?: never; publicKey?: never; serverKey?: never }

export async function createProject(formData: FormData): Promise<CreateProjectResult> {
  const name = (formData.get('name') as string | null)?.trim()

  if (!name || name.length < 2) {
    return { error: 'Project name must be at least 2 characters.' }
  }
  if (name.length > 60) {
    return { error: 'Project name must be 60 characters or fewer.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated.' }

  const projectId = generateProjectId()
  const publicKey = generatePublicKey()
  const serverKey = generateServerKey()

  const { data, error } = await supabase.rpc('create_project_with_keys', {
    p_id: projectId,
    p_name: name,
    p_public_key: publicKey,
    p_server_key: serverKey,
  })

  if (error) {
    console.error('[createProject]', error)
    return { error: 'Failed to create project. Please try again.' }
  }

  revalidatePath('/dashboard')
  return { project: data as Project, publicKey, serverKey }
}

export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .schema('platform')
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[listProjects]', error)
    return []
  }
  return (data ?? []) as Project[]
}

export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .schema('platform')
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) return null
  return data as Project
}

export async function getProjectKeys(projectId: string): Promise<ApiKey[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .schema('platform')
    .from('api_keys')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('type', { ascending: true })

  if (error) {
    console.error('[getProjectKeys]', error)
    return []
  }
  return (data ?? []) as ApiKey[]
}

export async function deleteProject(projectId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .schema('platform')
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error('[deleteProject]', error)
    return { error: 'Failed to delete project.' }
  }

  revalidatePath('/dashboard')
  return {}
}
