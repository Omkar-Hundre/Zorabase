'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { analyzeDatabaseQuery, type AIAnalysisResult } from '@/lib/ai/gemini'

export type DbTable = {
  id: string
  project_id: string
  name: string
  description: string | null
  created_at: string
}

export type DbColumn = {
  id: string
  table_id: string
  name: string
  data_type: string
  is_nullable: boolean
  is_primary_key: boolean
  default_value: string | null
  created_at: string
}

export type DbRecord = {
  id: string
  project_id: string
  table_name: string
  data: Record<string, any>
  created_at: string
  updated_at: string
}

export type AiInfoCard = {
  id: string
  project_id: string
  title: string
  natural_query: string
  result_summary: string
  result_metric: string | null
  query_config: Record<string, any>
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export async function listTables(projectId: string): Promise<DbTable[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .schema('platform')
    .from('database_tables')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[listTables]', error)
    return []
  }
  return (data ?? []) as DbTable[]
}

export async function listColumns(tableId: string): Promise<DbColumn[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .schema('platform')
    .from('database_columns')
    .select('*')
    .eq('table_id', tableId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[listColumns]', error)
    return []
  }
  return (data ?? []) as DbColumn[]
}

export async function createTable(
  projectId: string,
  name: string,
  description?: string,
  columns: Array<{ name: string; data_type: string; is_nullable: boolean }> = []
): Promise<{ table?: DbTable; error?: string }> {
  const sanitizedName = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
  if (!sanitizedName || sanitizedName.length < 2) {
    return { error: 'Table name must be at least 2 characters.' }
  }

  const supabase = await createClient()
  const tableId = `${projectId}_${sanitizedName}`

  const { data: tableData, error: tableError } = await supabase
    .schema('platform')
    .from('database_tables')
    .insert({
      id: tableId,
      project_id: projectId,
      name: sanitizedName,
      description: description?.trim() || null,
    })
    .select()
    .single()

  if (tableError) {
    console.error('[createTable error]', tableError)
    if (tableError.code === '23505') {
      return { error: 'A table with this name already exists in this project.' }
    }
    return { error: 'Failed to create table.' }
  }

  // Insert default primary key column 'id' if not provided
  const colsToInsert = [
    {
      table_id: tableId,
      name: 'id',
      data_type: 'uuid',
      is_nullable: false,
      is_primary_key: true,
    },
    ...columns.filter((c) => c.name.toLowerCase() !== 'id').map((c) => ({
      table_id: tableId,
      name: c.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      data_type: c.data_type,
      is_nullable: c.is_nullable,
      is_primary_key: false,
    })),
  ]

  const { error: colsError } = await supabase
    .schema('platform')
    .from('database_columns')
    .insert(colsToInsert)

  if (colsError) {
    console.error('[createColumns error]', colsError)
  }

  revalidatePath(`/dashboard/${projectId}/database`)
  return { table: tableData as DbTable }
}

export async function deleteTable(
  projectId: string,
  tableName: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Delete records first
  await supabase
    .schema('platform')
    .from('database_records')
    .delete()
    .eq('project_id', projectId)
    .eq('table_name', tableName)

  const { error } = await supabase
    .schema('platform')
    .from('database_tables')
    .delete()
    .eq('project_id', projectId)
    .eq('name', tableName)

  if (error) {
    console.error('[deleteTable]', error)
    return { error: 'Failed to delete table.' }
  }

  revalidatePath(`/dashboard/${projectId}/database`)
  return {}
}

export async function listRecords(
  projectId: string,
  tableName: string,
  limit = 50,
  offset = 0
): Promise<DbRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .schema('platform')
    .from('database_records')
    .select('*')
    .eq('project_id', projectId)
    .eq('table_name', tableName)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[listRecords]', error)
    return []
  }
  return (data ?? []) as DbRecord[]
}

export async function insertRecord(
  projectId: string,
  tableName: string,
  rowData: Record<string, any>
): Promise<{ record?: DbRecord; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .schema('platform')
    .from('database_records')
    .insert({
      project_id: projectId,
      table_name: tableName,
      data: rowData,
    })
    .select()
    .single()

  if (error) {
    console.error('[insertRecord]', error)
    return { error: 'Failed to insert record.' }
  }

  // Realtime Broadcast
  const { realtimeBroker, createRealtimeEvent } = await import('@/lib/realtime/broker')
  await realtimeBroker.publish(
    createRealtimeEvent({
      projectId,
      channel: tableName,
      event: 'INSERT',
      newData: { id: data.id, ...data.data },
    })
  )

  revalidatePath(`/dashboard/${projectId}/database`)
  return { record: data as DbRecord }
}

export async function updateRecord(
  projectId: string,
  tableName: string,
  recordId: string,
  rowData: Record<string, any>
): Promise<{ record?: DbRecord; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .schema('platform')
    .from('database_records')
    .update({
      data: rowData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recordId)
    .eq('project_id', projectId)
    .select()
    .single()

  if (error) {
    console.error('[updateRecord]', error)
    return { error: 'Failed to update record.' }
  }

  // Realtime Broadcast
  const { realtimeBroker, createRealtimeEvent } = await import('@/lib/realtime/broker')
  await realtimeBroker.publish(
    createRealtimeEvent({
      projectId,
      channel: tableName,
      event: 'UPDATE',
      newData: { id: data.id, ...data.data },
    })
  )

  revalidatePath(`/dashboard/${projectId}/database`)
  return { record: data as DbRecord }
}

export async function deleteRecord(
  projectId: string,
  tableName: string,
  recordId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .schema('platform')
    .from('database_records')
    .delete()
    .eq('id', recordId)
    .eq('project_id', projectId)

  if (error) {
    console.error('[deleteRecord]', error)
    return { error: 'Failed to delete record.' }
  }

  // Realtime Broadcast
  const { realtimeBroker, createRealtimeEvent } = await import('@/lib/realtime/broker')
  await realtimeBroker.publish(
    createRealtimeEvent({
      projectId,
      channel: tableName,
      event: 'DELETE',
      oldData: { id: recordId },
    })
  )

  revalidatePath(`/dashboard/${projectId}/database`)
  return {}
}

// ─── GenAI Database Intelligence & Live Info Cards ───

export async function askDatabaseAI(
  projectId: string,
  naturalQuery: string
): Promise<{ analysis?: AIAnalysisResult; error?: string }> {
  if (!naturalQuery || !naturalQuery.trim()) {
    return { error: 'Please provide a valid question.' }
  }

  const supabase = await createClient()

  // 1. Gather all tables
  const { data: tablesData } = await supabase
    .schema('platform')
    .from('database_tables')
    .select('id, name, description')
    .eq('project_id', projectId)

  const tables = tablesData || []

  // 2. Gather columns for all tables
  const tablesWithColumns = await Promise.all(
    tables.map(async (t) => {
      const { data: cols } = await supabase
        .schema('platform')
        .from('database_columns')
        .select('name, data_type, is_nullable')
        .eq('table_id', t.id)
      return {
        name: t.name,
        description: t.description,
        columns: cols || [],
      }
    })
  )

  // 3. Gather sample records & count
  const recordsSummary: Record<string, { totalCount: number; samples: any[] }> = {}
  for (const t of tables) {
    const { data: recs } = await supabase
      .schema('platform')
      .from('database_records')
      .select('data')
      .eq('project_id', projectId)
      .eq('table_name', t.name)
      .limit(10)

    recordsSummary[t.name] = {
      totalCount: recs?.length || 0,
      samples: recs?.map((r) => r.data) || [],
    }
  }

  try {
    const analysis = await analyzeDatabaseQuery({
      naturalQuery,
      schema: {
        tables: tablesWithColumns,
        recordsSummary,
      },
    })
    return { analysis }
  } catch (err: any) {
    return { error: err.message || 'AI analysis failed.' }
  }
}

export async function listPinnedInfoCards(projectId: string): Promise<AiInfoCard[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .schema('platform')
    .from('ai_info_cards')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_pinned', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[listPinnedInfoCards]', error)
    return []
  }
  return (data ?? []) as AiInfoCard[]
}

export async function pinInfoCard(
  projectId: string,
  title: string,
  naturalQuery: string,
  resultSummary: string,
  resultMetric?: string,
  queryConfig: Record<string, any> = {}
): Promise<{ card?: AiInfoCard; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .schema('platform')
    .from('ai_info_cards')
    .insert({
      project_id: projectId,
      title: title || 'Live Data Insight',
      natural_query: naturalQuery,
      result_summary: resultSummary,
      result_metric: resultMetric || null,
      query_config: queryConfig,
      is_pinned: true,
    })
    .select()
    .single()

  if (error) {
    console.error('[pinInfoCard error]', error)
    return { error: 'Failed to pin info card.' }
  }

  revalidatePath(`/dashboard/${projectId}/database`)
  return { card: data as AiInfoCard }
}

export async function deletePinnedCard(
  projectId: string,
  cardId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .schema('platform')
    .from('ai_info_cards')
    .delete()
    .eq('id', cardId)
    .eq('project_id', projectId)

  if (error) {
    console.error('[deletePinnedCard]', error)
    return { error: 'Failed to remove pinned card.' }
  }

  revalidatePath(`/dashboard/${projectId}/database`)
  return {}
}
