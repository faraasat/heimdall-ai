import { v4 as uuidv4 } from 'uuid'
import type { Finding, ScanType, AgentActivityLog, FindingSeverity, FindingState } from '../types/database'
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
    // Report finding immediately without waiting for AI analysis
    const findingData: Omit<Finding, 'id' | 'scan_id' | 'created_at' | 'updated_at'> = {
      ...finding,
      discovered_by_agent: this.name,
      discovered_at: new Date().toISOString(),
      state: 'new' as FindingState,
      ai_reasoning: {
        reasoning_chain: ['AI analysis pending...'],
        confidence_score: 0,
        alternative_hypotheses: [],
      },
      remediation: {
        steps: ['AI-powered remediation generating...'],
        estimated_effort: 'Calculating...',
        priority: finding.severity === 'critical' || finding.severity === 'high' ? 'immediate' : 'medium',
      },
    }

    // Save finding immediately
    await context.onFinding(findingData)

    // Run AI analysis asynchronously (don't block scan execution)
    this.enhanceFindingWithAI(finding, context).catch(err => {
      console.error('Background AI analysis failed:', err)
    })
  }

  private async enhanceFindingWithAI(
    finding: {
      title: string
      description: string
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
      affected_asset: string
      evidence: Record<string, any>
      cvss_score?: number
    },
    context: AgentContext
  ) {
    // This runs in background after finding is already reported
    try {
      const [analysis, remediation] = await Promise.all([
        analyzeVulnerability(finding),
        generateRemediation({
          ...finding,
          severity: finding.severity,
        }),
      ])

      // Log AI enhancement completion
      await this.log(context, `AI analysis completed for: ${finding.title}`, 'completed', {
        confidence: analysis.confidence,
        exploitability: analysis.exploitability,
      })

      // Note: In production, you'd update the finding in database here
      // For now, AI insights are logged but not persisted back
    } catch (error) {
      await this.log(context, `AI analysis failed for: ${finding.title}`, 'error', {
        error: String(error),
      })
    }
  }

  getName(): string {
    return this.name
  }

  getDescription(): string {
    return this.description
  }
}
