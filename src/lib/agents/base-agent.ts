import { v4 as uuidv4 } from 'uuid'
import type { Finding, ScanType, AgentActivityLog } from '../types/database'
import { analyzeVulnerability, generateRemediation } from '../ai/security-analysis'

export interface AgentContext {
  scanId: string
  target: string
  config: Record<string, any>
  onLog: (log: Omit<AgentActivityLog, 'id' | 'scan_id'>) => Promise<void>
  onFinding: (finding: Omit<Finding, 'id' | 'scan_id' | 'created_at' | 'updated_at'>) => Promise<void>
}

export abstract class BaseAgent {
  protected name: string
  protected description: string

  constructor(name: string, description: string) {
    this.name = name
    this.description = description
  }

  abstract execute(context: AgentContext): Promise<void>

  protected async log(
    context: AgentContext,
    action: string,
    status: 'running' | 'completed' | 'error',
    metadata: Record<string, any> = {}
  ) {
    await context.onLog({
      agent_type: this.name,
      message: action,
      status,
      details: metadata,
      timestamp: new Date().toISOString(),
    })
  }

  protected async reportFinding(
    context: AgentContext,
    finding: {
      title: string
      description: string
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
      affected_asset: string
      evidence: Record<string, any>
      cvss_score?: number
      cwe_id?: string
    }
  ) {
    // Use AI to analyze and enhance the finding
    const analysis = await analyzeVulnerability(finding)
    const remediation = await generateRemediation({
      ...finding,
      severity: finding.severity,
    })

    await context.onFinding({
      ...finding,
      discovered_by_agent: this.name,
      discovered_at: new Date().toISOString(),
      state: 'new',
      ai_reasoning: {
        reasoning_chain: analysis.reasoning,
        confidence_score: analysis.confidence,
        alternative_hypotheses: [],
      },
      remediation: {
        steps: remediation.steps,
        code_examples: remediation.code_examples,
        estimated_effort: remediation.estimated_effort,
        priority: remediation.priority,
      },
    })
  }

  getName(): string {
    return this.name
  }

  getDescription(): string {
    return this.description
  }
}
