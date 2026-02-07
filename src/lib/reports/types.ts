// Report Types and Interfaces

export interface ReportData {
  scan: {
    id: string;
    name: string;
    target: string;
    status: string;
    started_at: string;
    completed_at: string;
    duration_seconds: number;
    findings_count: number;
    scan_types?: string[];
  };
  findings: Array<{
    id: string;
    severity: string;
    title: string;
    description: string;
    affected_asset: string;
    cvss_score: number | null;
    cwe_id: string | null;
    evidence: any;
    ai_reasoning: any;
    remediation: any;
    state: string;
    discovered_by_agent: string;
  }>;
  user: {
    email: string;
    organization?: string;
  };
  generated_at: string;
}

export type ReportType = 'executive' | 'technical' | 'compliance';

export interface ReportMetadata {
  title: string;
  type: ReportType;
  generated_at: string;
  organization?: string;
}
