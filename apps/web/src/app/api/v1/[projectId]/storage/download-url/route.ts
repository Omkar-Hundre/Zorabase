import { handleCorsPreflight, jsonWithCors } from '@/lib/api/cors'
import { validateProjectApiKey } from '@/lib/api/auth'
import { createSignedDownloadUrl } from '@/lib/storage/s3'

export async function OPTIONS() {
  return handleCorsPreflight()
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const authCheck = await validateProjectApiKey(projectId, request)
  if (!authCheck.valid) {
    return jsonWithCors({ data: null, error: { code: 'UNAUTHORIZED', message: authCheck.error } }, 401)
  }

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  const expiresIn = Number(searchParams.get('expiresIn')) || 3600

  if (!key) {
    return jsonWithCors(
      { data: null, error: { code: 'BAD_REQUEST', message: 'Missing "key" query param' } },
      400
    )
  }

  try {
    const signedUrl = await createSignedDownloadUrl({ objectKey: key, expiresIn })
    return jsonWithCors({ data: { signedUrl, expiresAt: Date.now() + expiresIn * 1000 }, error: null }, 200)
  } catch (err: any) {
    return jsonWithCors({ data: null, error: { code: 'STORAGE_ERROR', message: err.message } }, 500)
  }
}
