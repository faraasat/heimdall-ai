import { renderToBuffer } from '@react-pdf/renderer';
import { ExecutiveReport } from './templates/executive';
import { TechnicalReport } from './templates/technical';
import { ReportData, ReportType, ReportMetadata } from './types';
import { createClient } from '@/lib/supabase/server';

export async function generateReport(
  scanId: string,
  reportType: ReportType,
  userId: string
): Promise<{ fileUrl: string; fileSizeBytes: number }> {
  const supabase = await createClient();

  // Fetch scan data with findings
  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .single();

  if (scanError || !scan) {
    throw new Error('Scan not found');
  }

  // Fetch findings
  const { data: findings, error: findingsError } = await supabase
    .from('findings')
    .select('*')
    .eq('scan_id', scanId)
    .order('severity', { ascending: false });

  if (findingsError) {
    throw new Error('Failed to fetch findings');
  }

  // Fetch user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('email, organization')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  // Prepare report data
  const reportData: ReportData = {
    scan: {
      id: scan.id,
      name: scan.name,
      target: scan.target,
      status: scan.status,
      started_at: scan.started_at,
      completed_at: scan.completed_at,
      duration_seconds: scan.duration_seconds,
      findings_count: scan.findings_count,
      scan_types: scan.scan_types,
    },
    findings: findings || [],
    user: {
      email: user.email,
      organization: user.organization,
    },
    generated_at: new Date().toISOString(),
  };

  const metadata: ReportMetadata = {
    title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${scan.name}`,
    type: reportType,
    generated_at: new Date().toISOString(),
    organization: user.organization,
  };

  // Generate PDF based on type
  let pdfBuffer: Buffer;

  try {
    if (reportType === 'executive') {
      pdfBuffer = await renderToBuffer(
        <ExecutiveReport data={reportData} metadata={metadata} />
      );
    } else if (reportType === 'technical') {
      pdfBuffer = await renderToBuffer(
        <TechnicalReport data={reportData} metadata={metadata} />
      );
    } else {
      // For compliance reports, use technical template for now
      pdfBuffer = await renderToBuffer(
        <TechnicalReport data={reportData} metadata={metadata} />
      );
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }

  // Upload to Supabase Storage
  const fileName = `reports/${userId}/${scanId}/${reportType}-${Date.now()}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('reports')
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading PDF:', uploadError);
    throw new Error('Failed to upload report to storage');
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('reports').getPublicUrl(fileName);

  // Save report metadata to database
  const { error: dbError } = await supabase.from('reports').insert({
    scan_id: scanId,
    user_id: userId,
    report_type: reportType,
    file_url: publicUrl,
    file_size_bytes: pdfBuffer.length,
  });

  if (dbError) {
    console.error('Error saving report metadata:', dbError);
    // Don't throw, file is uploaded successfully
  }

  return {
    fileUrl: publicUrl,
    fileSizeBytes: pdfBuffer.length,
  };
}
