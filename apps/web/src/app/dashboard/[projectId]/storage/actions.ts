'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createSignedUploadUrl,
  createSignedDownloadUrl,
  deleteS3Object,
  testS3Connection,
} from '@/lib/storage/s3'

export type StorageBucket = {
  id: string
  project_id: string
  name: string
  is_public: boolean
  created_at: string
}

export type StorageObject = {
  id: string
  project_id: string
  bucket_name: string
  object_key: string
  owner_id: string | null
  mime_type: string | null
  size_bytes: number
  created_at: string
  updated_at: string
}

export async function checkStorageHealth() {
  return await testS3Connection()
}

export async function listBuckets(projectId: string): Promise<StorageBucket[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .schema('platform')
    .from('storage_buckets')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[listBuckets]', error)
    return []
  }
  return (data ?? []) as StorageBucket[]
}

export async function createBucket(
  projectId: string,
  name: string,
  isPublic: boolean = false
): Promise<{ bucket?: StorageBucket; error?: string }> {
  const sanitizedName = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-')

  if (!sanitizedName || sanitizedName.length < 2) {
    return { error: 'Bucket name must be at least 2 characters (alphanumeric and dashes).' }
  }

  const supabase = await createClient()
  const bucketId = `${projectId}_${sanitizedName}`

  const { data, error } = await supabase
    .schema('platform')
    .from('storage_buckets')
    .insert({
      id: bucketId,
      project_id: projectId,
      name: sanitizedName,
      is_public: isPublic,
    })
    .select()
    .single()

  if (error) {
    console.error('[createBucket]', error)
    if (error.code === '23505') {
      return { error: 'A bucket with this name already exists in this project.' }
    }
    return { error: 'Failed to create bucket.' }
  }

  revalidatePath(`/dashboard/${projectId}/storage`)
  return { bucket: data as StorageBucket }
}

export async function deleteBucket(
  projectId: string,
  bucketName: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  // First delete all objects in the bucket from S3
  const { data: objects } = await supabase
    .schema('platform')
    .from('storage_objects')
    .select('object_key')
    .eq('project_id', projectId)
    .eq('bucket_name', bucketName)

  if (objects && objects.length > 0) {
    for (const obj of objects) {
      try {
        await deleteS3Object({ objectKey: obj.object_key })
      } catch (err) {
        console.error('[deleteS3Object error on bucket delete]', err)
      }
    }
  }

  const { error } = await supabase
    .schema('platform')
    .from('storage_buckets')
    .delete()
    .eq('project_id', projectId)
    .eq('name', bucketName)

  if (error) {
    console.error('[deleteBucket]', error)
    return { error: 'Failed to delete bucket.' }
  }

  revalidatePath(`/dashboard/${projectId}/storage`)
  return {}
}

export async function listObjects(
  projectId: string,
  bucketName: string
): Promise<StorageObject[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .schema('platform')
    .from('storage_objects')
    .select('*')
    .eq('project_id', projectId)
    .eq('bucket_name', bucketName)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[listObjects]', error)
    return []
  }
  return (data ?? []) as StorageObject[]
}

export async function getUploadUrl(
  projectId: string,
  bucketName: string,
  filename: string,
  contentType: string
): Promise<{ uploadUrl?: string; objectKey?: string; error?: string }> {
  try {
    const res = await createSignedUploadUrl({
      projectId,
      bucketName,
      filename,
      contentType: contentType || 'application/octet-stream',
    })
    return { uploadUrl: res.uploadUrl, objectKey: res.objectKey }
  } catch (err: any) {
    console.error('[getUploadUrl]', err)
    return { error: err.message || 'Failed to generate presigned upload URL.' }
  }
}

export async function registerUploadedObject(
  projectId: string,
  bucketName: string,
  objectKey: string,
  mimeType: string,
  sizeBytes: number
): Promise<{ object?: StorageObject; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .schema('platform')
    .from('storage_objects')
    .insert({
      project_id: projectId,
      bucket_name: bucketName,
      object_key: objectKey,
      owner_id: user?.id ?? null,
      mime_type: mimeType || 'application/octet-stream',
      size_bytes: sizeBytes || 0,
    })
    .select()
    .single()

  if (error) {
    console.error('[registerUploadedObject]', error)
    return { error: 'Failed to record object metadata.' }
  }

  revalidatePath(`/dashboard/${projectId}/storage`)
  return { object: data as StorageObject }
}

export async function getDownloadUrl(
  objectKey: string
): Promise<{ downloadUrl?: string; error?: string }> {
  try {
    const downloadUrl = await createSignedDownloadUrl({ objectKey, expiresIn: 3600 })
    return { downloadUrl }
  } catch (err: any) {
    console.error('[getDownloadUrl]', err)
    return { error: err.message || 'Failed to generate download URL.' }
  }
}

export async function deleteObject(
  projectId: string,
  bucketName: string,
  objectKey: string
): Promise<{ error?: string }> {
  try {
    await deleteS3Object({ objectKey })

    const supabase = await createClient()
    const { error } = await supabase
      .schema('platform')
      .from('storage_objects')
      .delete()
      .eq('project_id', projectId)
      .eq('bucket_name', bucketName)
      .eq('object_key', objectKey)

    if (error) {
      console.error('[deleteObject metadata error]', error)
    }

    revalidatePath(`/dashboard/${projectId}/storage`)
    return {}
  } catch (err: any) {
    console.error('[deleteObject]', err)
    return { error: err.message || 'Failed to delete object from S3.' }
  }
}
