import { validateProjectApiKey } from '@/lib/api/auth'
import { realtimeBroker, RealtimeEvent } from '@/lib/realtime/broker'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const authCheck = await validateProjectApiKey(projectId, request)
  if (!authCheck.valid) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel') || '*'

  const encoder = new TextEncoder()

  let unsubscribe: (() => void) | null = null
  let heartbeatTimer: NodeJS.Timeout | null = null

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial connected event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ projectId, channel, status: 'subscribed' })}\n\n`)
      )

      // 2. Subscribe to broker
      unsubscribe = realtimeBroker.subscribe(projectId, channel, (event: RealtimeEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`event: message\ndata: ${JSON.stringify(event)}\n\n`)
          )
        } catch (err) {
          console.error('[Realtime Stream Push Error]', err)
        }
      })

      // 3. Keep-alive heartbeat every 15s
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: {"time": "${new Date().toISOString()}"}\n\n`))
        } catch {
          if (heartbeatTimer) clearInterval(heartbeatTimer)
        }
      }, 15000)
    },
    cancel() {
      if (unsubscribe) unsubscribe()
      if (heartbeatTimer) clearInterval(heartbeatTimer)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const authCheck = await validateProjectApiKey(projectId, request)
  if (!authCheck.valid) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { channel, event, payload } = await request.json()
    if (!channel || !event) {
      return new Response(JSON.stringify({ error: 'Missing channel or event' }), { status: 400 })
    }

    const realtimeEvent: RealtimeEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      projectId,
      channel,
      event: event || 'BROADCAST',
      payload: payload || {},
      timestamp: new Date().toISOString(),
    }

    await realtimeBroker.publish(realtimeEvent)

    return new Response(JSON.stringify({ success: true, event: realtimeEvent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
