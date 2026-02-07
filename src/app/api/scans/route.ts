import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import { getOrchestrator } from '@/lib/agents/orchestrator'
import type { ScanType } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { target, scan_type, configuration = {} } = await request.json()

    if (!target || !scan_type) {
      return NextResponse.json(
        { error: 'Target and scan_type are required' },
        { status: 400 }
      )
    }

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        user_id: user.id,
        target,
        scan_type: scan_type as ScanType,
        status: 'pending',
        configuration,
      })
      .select()
      .single()

    if (scanError) {
      console.error('Error creating scan:', scanError)
      return NextResponse.json({ error: 'Failed to create scan' }, { status: 500 })
    }

    // Start scan execution in background (in production, would use a queue)
    executeScan(scan.id, scan_type, target, configuration, user.id).catch(console.error)

    return NextResponse.json({ scan })
  } catch (error) {
    console.error('Scan creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's scans
    const { data: scans, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching scans:', error)
      return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 })
    }

    return NextResponse.json({ scans })
  } catch (error) {
    console.error('Scans fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Background scan execution
async function executeScan(
  scanId: string,
  scanType: ScanType,
  target: string,
  config: Record<string, any>,
  userId: string
) {
  const supabase = await createClient()
  const orchestrator = getOrchestrator()

  const startTime = Date.now()

  try {
    // Update scan to running
    await supabase
      .from('scans')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .eq('id', scanId)

    // Execute scan with callbacks
    await orchestrator.executeScan(scanId, scanType, target, config, {
      onLog: async (log) => {
        await supabase.from('agent_activity_logs').insert({
          scan_id: scanId,
          ...log,
        })
      },
      onFinding: async (finding) => {
        await supabase.from('findings').insert({
          scan_id: scanId,
          ...finding,
        })
      },
      onStatusChange: async (status) => {
        const updates: any = { status }
        
        if (status === 'completed' || status === 'failed') {
          updates.completed_at = new Date().toISOString()
          updates.duration_seconds = Math.floor((Date.now() - startTime) / 1000)
        }

        await supabase
          .from('scans')
          .update(updates)
          .eq('id', scanId)
      },
    })
  } catch (error) {
    console.error('Scan execution error:', error)
    
    await supabase
      .from('scans')
      .update({
        status: 'failed',
        error_message: String(error),
        completed_at: new Date().toISOString(),
        duration_seconds: Math.floor((Date.now() - startTime) / 1000),
      })
      .eq('id', scanId)
  }
}
