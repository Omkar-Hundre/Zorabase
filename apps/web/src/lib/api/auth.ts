import { createClient } from '@/lib/supabase/server'

export async function validateProjectApiKey(
  projectId: string,
  request: Request
): Promise<{ valid: boolean; error?: string; keyType?: 'public' | 'server' }> {
  const apiKey =
    request.headers.get('apikey') ||
    request.headers.get('x-api-key') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!apiKey) {
    return { valid: false, error: 'Missing API key header (apikey, x-api-key, or Authorization)' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .schema('platform')
    .from('api_keys')
    .select('type, is_active')
    .eq('project_id', projectId)
    .eq('key_value', apiKey)
    .single()

  if (error || !data || !data.is_active) {
    return { valid: false, error: 'Invalid or inactive API key for this project' }
  }

  return { valid: true, keyType: data.type as 'public' | 'server' }
}
