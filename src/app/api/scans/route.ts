import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    const body = await request.json()
    const {
      target: targetRaw,
      name: nameRaw,
      scan_types: scanTypesRaw,
      scan_type: scanTypeLegacy,
      configuration: configurationRaw,
      ...rest
    } = body || {}

    const target = typeof targetRaw === 'string' ? targetRaw.trim() : ''
    const name = typeof nameRaw === 'string' && nameRaw.trim().length > 0
      ? nameRaw.trim()
      : `Scan ${new Date().toISOString()}`

    const requestedScanTypes = Array.isArray(scanTypesRaw)
      ? scanTypesRaw
      : scanTypeLegacy
        ? [scanTypeLegacy]
        : []

    const validScanTypes = new Set<ScanType>(['network', 'webapp', 'api', 'cloud', 'iot', 'config'])
    const scan_types: ScanType[] = requestedScanTypes
      .filter((t: unknown) => typeof t === 'string')
      .map((t: string) => t.trim())
      .filter((t: string): t is ScanType => validScanTypes.has(t as ScanType))

    const configuration = {
      ...(typeof configurationRaw === 'object' && configurationRaw ? configurationRaw : {}),
      ...rest,
    }

    if (!target || scan_types.length === 0) {
      return NextResponse.json(
        { error: 'Target and at least one valid scan type are required' },
        { status: 400 }
      )
    }

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        user_id: user.id,
        name,
        target,
        scan_types,
        status: 'pending',
        configuration,
        findings_count: 0,
      })
      .select()
      .single()

    if (scanError) {
      console.error('Error creating scan:', scanError)
      return NextResponse.json({ error: 'Failed to create scan' }, { status: 500 })
    }

    // Start scan execution in background (in production, would use a queue)
    executeScan(scan.id, scan_types, target, configuration, user.id).catch(console.error)

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
  scanTypes: ScanType[],
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
    await orchestrator.executeScanTypes(scanId, scanTypes, target, config, {
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

          const { count } = await supabase
            .from('findings')
            .select('id', { count: 'exact', head: true })
            .eq('scan_id', scanId)

          if (typeof count === 'number') {
            updates.findings_count = count
          }
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
