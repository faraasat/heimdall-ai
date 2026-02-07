import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get scan with findings and logs
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (scanError || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    // Get findings
    const { data: findings } = await supabase
      .from('findings')
      .select('*')
      .eq('scan_id', id)
      .order('severity', { ascending: true })

    // Get activity logs
    const { data: logs } = await supabase
      .from('agent_activity_logs')
      .select('*')
      .eq('scan_id', id)
      .order('timestamp', { ascending: true })

    return NextResponse.json({
      scan,
      findings: findings || [],
      logs: logs || [],
    })
  } catch (error) {
    console.error('Scan fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
