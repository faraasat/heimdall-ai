import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify scan belongs to user
  const { data: scan } = await supabase
    .from('scans')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
  }

  if (scan.status !== 'running') {
    return NextResponse.json({ error: 'Scan is not running' }, { status: 400 })
  }

  // Update scan status to cancelled
  const { error } = await supabase
    .from('scans')
    .update({
      status: 'cancelled',
      completed_at: new Date().toISOString(),
      error_message: 'Scan stopped by user',
    })
    .eq('id', id)

  if (error) {
    console.error('Error stopping scan:', error)
    return NextResponse.json({ error: 'Failed to stop scan' }, { status: 500 })
  }

  // Log the cancellation
  await supabase.from('agent_activity_logs').insert({
    scan_id: id,
    agent_type: 'System',
    message: 'Scan cancelled by user',
    status: 'completed',
    timestamp: new Date().toISOString(),
  })

  return NextResponse.json({ success: true })
}
