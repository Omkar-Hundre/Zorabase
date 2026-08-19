import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL || ''

let pool: Pool | null = null

export function getDatabasePool(): Pool | null {
  if (!databaseUrl) {
    return null
  }

  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Unexpected Error]', err)
    })
  }

  return pool
}

export async function testDatabaseConnectivity(): Promise<{
  ok: boolean
  provider: 'aws_rds' | 'supabase_hybrid'
  message: string
}> {
  const customPool = getDatabasePool()
  if (customPool) {
    try {
      const client = await customPool.connect()
      try {
        const res = await client.query('SELECT version(), current_database()')
        return {
          ok: true,
          provider: 'aws_rds',
          message: `Connected to AWS RDS PostgreSQL (${res.rows[0].current_database}).`,
        }
      } finally {
        client.release()
      }
    } catch (err: any) {
      return {
        ok: false,
        provider: 'aws_rds',
        message: `AWS RDS connection failed: ${err.message}`,
      }
    }
  }

  return {
    ok: true,
    provider: 'supabase_hybrid',
    message: 'Using database with schema isolation.',
  }
}
