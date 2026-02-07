export type ScanType = 'network' | 'webapp' | 'api' | 'cloud' | 'iot' | 'config'
export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type FindingState = 'new' | 'confirmed' | 'false_positive' | 'remediated' | 'accepted_risk'
export type ReportType = 'executive' | 'technical' | 'compliance'
export type AgentStatus = 'running' | 'completed' | 'error'
export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  full_name?: string
  organization?: string
  role: UserRole
  preferences: {
    timezone?: string
    notifications?: boolean
  }
  quota: {
    max_scans_per_month: number
    storage_limit_mb: number
  }
  created_at: string
  last_login_at?: string
  updated_at: string
}

export interface Scan {
  id: string
  user_id: string
  name: string
  target: string
  scan_types: ScanType[]
  status: ScanStatus
  configuration: Record<string, any>
  started_at?: string
  completed_at?: string
  duration_seconds?: number
  findings_count: number
  error_message?: string
  created_at: string
  updated_at: string
}

export interface Finding {
  id: string
  scan_id: string
  severity: FindingSeverity
  title: string
  description: string
  affected_asset: string
  cvss_score?: number
  cwe_id?: string
  evidence: Record<string, any>
  ai_reasoning: {
    reasoning_chain?: string[]
    confidence_score?: number
    alternative_hypotheses?: string[]
  }
  remediation: {
    steps?: string[]
    code_examples?: string[]
    estimated_effort?: string
    priority?: string
  }
  state: FindingState
  discovered_by_agent: string
  discovered_at: string
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  scan_id?: string
  user_id: string
  report_type: ReportType
  file_url?: string
  file_size_bytes?: number
  generated_at: string
  created_at: string
}

export interface AgentActivityLog {
  id: string
  scan_id: string
  agent_type: string
  message: string
  status: AgentStatus
  details: Record<string, any>
  timestamp: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  context: Record<string, any>
  timestamp: string
}

export interface ScanConfig {
  target: string
  scan_type: ScanType
  intensity?: 'light' | 'normal' | 'aggressive'
  excluded_targets?: string[]
  authentication?: {
    type: string
    credentials?: Record<string, string>
  }
  rate_limit?: number
  timeout?: number
}
