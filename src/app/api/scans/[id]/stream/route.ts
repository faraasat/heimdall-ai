import { createClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  // Verify user authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Verify scan belongs to user
  const { data: scan } = await supabase
    .from('scans')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!scan) {
    return new Response('Scan not found', { status: 404 })
  }

  // Create a readable stream for SSE
  const encoder = new TextEncoder()
  
  let intervalId: NodeJS.Timeout

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      send({ type: 'connected', message: 'Connected to scan stream' })

      // Poll for updates every 2 seconds
      intervalId = setInterval(async () => {
        try {
          const supabase = await createClient()

          // Fetch scan status
          const { data: currentScan } = await supabase
            .from('scans')
            .select('*')
            .eq('id', params.id)
            .single()

          if (currentScan) {
            send({ 
              type: 'scan', 
              data: currentScan 
            })

            // Fetch recent logs
            const { data: logs } = await supabase
              .from('agent_activity_logs')
              .select('*')
              .eq('scan_id', params.id)
              .order('timestamp', { ascending: false })
              .limit(10)

            if (logs && logs.length > 0) {
              send({ 
                type: 'logs', 
                data: logs 
              })
            }

            // Fetch findings
            const { data: findings } = await supabase
              .from('findings')
              .select('*')
              .eq('scan_id', params.id)
              .order('created_at', { ascending: false })

            if (findings) {
              send({ 
                type: 'findings', 
                data: findings 
              })
            }

            // If scan is completed or failed, close the stream
            if (currentScan.status === 'completed' || currentScan.status === 'failed') {
              send({ type: 'done', message: 'Scan finished' })
              clearInterval(intervalId)
              controller.close()
            }
          }
        } catch (error) {
          console.error('SSE error:', error)
          send({ type: 'error', message: 'Error fetching data' })
        }
      }, 2000)
    },
    cancel() {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
