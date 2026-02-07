import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateReport } from '@/lib/reports/generator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const scanId = (await params).id;

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { reportType } = body;

    if (
      !reportType ||
      !['executive', 'technical', 'compliance'].includes(reportType)
    ) {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      );
    }

    // Verify user owns the scan
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('user_id')
      .eq('id', scanId)
      .single();

    if (scanError || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    if (scan.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Generate report
    const { fileUrl, fileSizeBytes } = await generateReport(
      scanId,
      reportType,
      user.id
    );

    return NextResponse.json({
      success: true,
      fileUrl,
      fileSizeBytes,
      reportType,
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}
