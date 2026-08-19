import { handleCorsPreflight, jsonWithCors } from '@/lib/api/cors'
import { validateProjectApiKey } from '@/lib/api/auth'
import { createSignedUploadUrl } from '@/lib/storage/s3'

export async function OPTIONS() {
  return handleCorsPreflight()
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const authCheck = await validateProjectApiKey(projectId, request)
  if (!authCheck.valid) {
    return jsonWithCors({ data: null, error: { code: 'UNAUTHORIZED', message: authCheck.error } }, 401)
  }

  try {
    const { bucket, filename, contentType } = await request.json()
    if (!bucket || !filename) {
      return jsonWithCors(
        { data: null, error: { code: 'BAD_REQUEST', message: 'Missing "bucket" or "filename"' } },
        400
      )
    }

    const res = await createSignedUploadUrl({
      projectId,
      bucketName: bucket,
      filename,
      contentType: contentType || 'application/octet-stream',
    })

    return jsonWithCors({ data: res, error: null }, 200)
  } catch (err: any) {
    return jsonWithCors({ data: null, error: { code: 'STORAGE_ERROR', message: err.message } }, 500)
  }
}
