import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const region = process.env.AWS_REGION || 'eu-north-1'
const bucketName = process.env.AWS_S3_BUCKET || 'zorabase'
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

export const s3Client = new S3Client({
  region,
  credentials:
    accessKeyId && secretAccessKey
      ? {
          accessKeyId,
          secretAccessKey,
        }
      : undefined,
})

export interface StorageProvider {
  createSignedUploadUrl(params: {
    projectId: string
    bucketName: string
    filename: string
    contentType: string
    expiresIn?: number
  }): Promise<{ uploadUrl: string; objectKey: string; expiresAt: number }>

  createSignedDownloadUrl(params: {
    objectKey: string
    expiresIn?: number
  }): Promise<string>

  deleteObject(params: { objectKey: string }): Promise<void>
}

export function sanitizeKey(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export function buildObjectKey(projectId: string, bucketName: string, filename: string): string {
  const safeFilename = sanitizeKey(filename)
  const timestamp = Date.now()
  return `projects/${projectId}/${bucketName}/${timestamp}_${safeFilename}`
}

export async function createSignedUploadUrl({
  projectId,
  bucketName: bucket,
  filename,
  contentType,
  expiresIn = 900, // 15 minutes
}: {
  projectId: string
  bucketName: string
  filename: string
  contentType: string
  expiresIn?: number
}) {
  const objectKey = buildObjectKey(projectId, bucket, filename)

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn })

  return {
    uploadUrl,
    objectKey,
    expiresAt: Date.now() + expiresIn * 1000,
  }
}

export async function createSignedDownloadUrl({
  objectKey,
  expiresIn = 3600, // 1 hour
}: {
  objectKey: string
  expiresIn?: number
}) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

export async function deleteS3Object({ objectKey }: { objectKey: string }) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  })

  await s3Client.send(command)
}

export async function testS3Connection(): Promise<{ ok: boolean; message: string }> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1,
    })
    await s3Client.send(command)
    return { ok: true, message: `Connected to bucket "${bucketName}" in region ${region}.` }
  } catch (err: any) {
    return { ok: false, message: err.message || 'S3 Connection failed.' }
  }
}
