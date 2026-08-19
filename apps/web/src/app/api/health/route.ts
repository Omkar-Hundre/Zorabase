import { NextResponse } from 'next/server'
import { testS3Connection } from '@/lib/storage/s3'

export async function GET() {
  const s3 = await testS3Connection()
  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    services: {
      api: 'healthy',
      database: 'healthy',
      storage: s3.ok ? 'healthy' : 'degraded',
      ai: process.env.GEMINI_API_KEY ? 'configured' : 'missing_key',
    },
    timestamp: new Date().toISOString(),
  })
}
