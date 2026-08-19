import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateProjectApiKey } from '@/lib/api/auth'
import { handleCorsPreflight, jsonWithCors } from '@/lib/api/cors'

export async function OPTIONS() {
  return handleCorsPreflight()
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; table: string }> }
) {
  const { projectId, table } = await params
  const authCheck = await validateProjectApiKey(projectId, request)
  if (!authCheck.valid) {
    return jsonWithCors({ data: null, error: { code: 'UNAUTHORIZED', message: authCheck.error } }, 401)
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 1000)
  const offset = Number(searchParams.get('offset')) || 0
  const orderParam = searchParams.get('order') // e.g. "created_at.desc"

  const supabase = await createClient()
  let query = supabase
    .schema('platform')
    .from('database_records')
    .select('id, data, created_at, updated_at')
    .eq('project_id', projectId)
    .eq('table_name', table)

  // Handle order
  if (orderParam) {
    const [col, dir] = orderParam.split('.')
    if (col === 'created_at' || col === 'updated_at') {
      query = query.order(col, { ascending: dir === 'asc' })
    }
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query
  if (error) {
    return jsonWithCors({ data: null, error: { code: 'QUERY_ERROR', message: error.message } }, 500)
  }

  // Format response flattening data object with id
  const formatted = (data || []).map((r: any) => ({
    id: r.id,
    ...r.data,
    _created_at: r.created_at,
    _updated_at: r.updated_at,
  }))

  return jsonWithCors({ data: formatted, error: null }, 200)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string; table: string }> }
) {
  const { projectId, table } = await params
  const authCheck = await validateProjectApiKey(projectId, request)
  if (!authCheck.valid) {
    return jsonWithCors({ data: null, error: { code: 'UNAUTHORIZED', message: authCheck.error } }, 401)
  }

  try {
    const body = await request.json()
    const supabase = await createClient()

    const isArray = Array.isArray(body)
    const recordsToInsert = isArray
      ? body.map((item) => ({ project_id: projectId, table_name: table, data: item }))
      : [{ project_id: projectId, table_name: table, data: body }]

    const { data, error } = await supabase
      .schema('platform')
      .from('database_records')
      .insert(recordsToInsert)
      .select('id, data, created_at')

    if (error) {
      return jsonWithCors({ data: null, error: { code: 'INSERT_ERROR', message: error.message } }, 500)
    }

    const formatted = (data || []).map((r: any) => ({
      id: r.id,
      ...r.data,
      _created_at: r.created_at,
    }))

    // Trigger realtime broadcast
    const { realtimeBroker, createRealtimeEvent } = await import('@/lib/realtime/broker')
    await realtimeBroker.publish(
      createRealtimeEvent({
        projectId,
        channel: table,
        event: 'INSERT',
        newData: isArray ? formatted : formatted[0],
      })
    )

    return jsonWithCors({ data: isArray ? formatted : formatted[0], error: null }, 201)
  } catch (err: any) {
    return jsonWithCors({ data: null, error: { code: 'INVALID_JSON', message: err.message } }, 400)
  }
}
