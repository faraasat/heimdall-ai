import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import type { FindingState } from "@/lib/types/database"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { state } = await request.json()

    if (!state) {
      return NextResponse.json(
        { error: 'State is required' },
        { status: 400 }
      )
    }

    const validStates: FindingState[] = ['new', 'confirmed', 'false_positive', 'remediated', 'accepted_risk']
    if (!validStates.includes(state)) {
      return NextResponse.json(
        { error: 'Invalid state value' },
        { status: 400 }
      )
    }

    // Verify finding belongs to user's scan
    const { data: finding } = await supabase
      .from('findings')
      .select('id, scan:scans!inner(user_id)')
      .eq('id', id)
      .single()

    const scan = finding?.scan as any
    
    if (!finding || !scan || scan.user_id !== user.id) {
      return NextResponse.json({ error: 'Finding not found' }, { status: 404 })
    }

    // Update finding state
    const { data: updatedFinding, error: updateError } = await supabase
      .from('findings')
      .update({ 
        state,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating finding state:', updateError)
      return NextResponse.json({ error: 'Failed to update finding state' }, { status: 500 })
    }

    return NextResponse.json({ finding: updatedFinding })
  } catch (error) {
    console.error('Finding state update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
