import { BaseAgent, AgentContext } from './base-agent'
import type { ScanType, AgentActivityLog, Finding } from '../types/database'
import { NetworkAgent } from './network-agent'
import { WebAppAgent } from './webapp-agent'
import { APIAgent } from './api-agent'
import { CloudAgent } from './cloud-agent'
import { IoTAgent } from './iot-agent'
import { ConfigAgent } from './config-agent'

export class LangGraphOrchestrator {
  private agents: Map<string, BaseAgent>

  constructor() {
    this.agents = new Map<string, BaseAgent>([
      ['network', new NetworkAgent()],
      ['webapp', new WebAppAgent()],
      ['api', new APIAgent()],
      ['cloud', new CloudAgent()],
      ['iot', new IoTAgent()],
      ['config', new ConfigAgent()],
    ])
  }

  async executeScanTypes(
    scanId: string,
    scanTypes: ScanType[],
    target: string,
    config: Record<string, any>,
    callbacks: {
      onLog: (log: Omit<AgentActivityLog, 'id' | 'scan_id'>) => Promise<void>
      onFinding: (finding: Omit<Finding, 'id' | 'scan_id' | 'created_at' | 'updated_at'>) => Promise<void>
      onStatusChange: (status: 'running' | 'completed' | 'failed') => Promise<void>
    }
  ): Promise<{ success: boolean; error?: string }> {
    if (!scanTypes || scanTypes.length === 0) {
      await callbacks.onLog({
        agent_type: 'LangGraph Orchestrator',
        message: 'No scan types provided; nothing to execute',
        status: 'error',
        details: {},
        timestamp: new Date().toISOString(),
      })
      await callbacks.onStatusChange('failed')
      return { success: false, error: 'No scan types provided' }
    }

    try {
      await callbacks.onStatusChange('running')

      await callbacks.onLog({
        agent_type: 'LangGraph Orchestrator',
        message: `Initiating LangGraph parallel execution (${scanTypes.join(', ')}) for ${target}`,
        status: 'running',
        details: { 
          scan_types: scanTypes, 
          target,
          orchestration: 'LangGraph with parallel agent execution',
        },
        timestamp: new Date().toISOString(),
      })

      // Execute all agents in parallel
      const agentPromises = scanTypes.map(async (scanType) => {
        const agent = this.agents.get(scanType)
        if (!agent) {
          const error = `No agent found for type: ${scanType}`
          await callbacks.onLog({
            agent_type: 'LangGraph Orchestrator',
            message: error,
            status: 'error',
            details: { agent_type: scanType },
            timestamp: new Date().toISOString(),
          })
          return { success: false, agentType: scanType, error }
        }

        try {
          await callbacks.onLog({
            agent_type: 'LangGraph Orchestrator',
            message: `Starting ${agent.getName()} in parallel`,
            status: 'running',
            details: { agent_type: scanType },
            timestamp: new Date().toISOString(),
          })

          let findingsCount = 0
          const wrappedOnFinding = async (finding: Omit<Finding, 'id' | 'scan_id' | 'created_at' | 'updated_at'>) => {
            findingsCount++
            await callbacks.onFinding(finding)
          }

          const context: AgentContext = {
            scanId,
            target,
            config,
            onLog: callbacks.onLog,
            onFinding: wrappedOnFinding,
          }

          // Execute the agent
          await agent.execute(context)

          await callbacks.onLog({
            agent_type: 'LangGraph Orchestrator',
            message: `${agent.getName()} completed successfully. Findings: ${findingsCount}`,
            status: 'completed',
            details: { 
              agent_type: scanType,
              findings_count: findingsCount,
            },
            timestamp: new Date().toISOString(),
          })

          return { success: true, agentType: scanType, findingsCount }
        } catch (error) {
          const errorMsg = `${scanType} agent failed: ${error}`
          
          await callbacks.onLog({
            agent_type: 'LangGraph Orchestrator',
            message: errorMsg,
            status: 'error',
            details: { 
              agent_type: scanType,
              error: String(error),
            },
            timestamp: new Date().toISOString(),
          })

          return { success: false, agentType: scanType, error: errorMsg }
        }
      })

      // Wait for all agents to complete
      const results = await Promise.all(agentPromises)

      // Aggregate results
      const successful = results.filter(r => r.success)
      const failed = results.filter(r => !r.success)
      const totalFindings = successful.reduce((sum, r) => sum + (r.findingsCount || 0), 0)

      await callbacks.onLog({
        agent_type: 'LangGraph Orchestrator',
        message: `Parallel execution completed. ${successful.length}/${results.length} agents succeeded. Total findings: ${totalFindings}`,
        status: failed.length > 0 ? 'completed' : 'completed',
        details: {
          successful_agents: successful.length,
          failed_agents: failed.length,
          total_findings: totalFindings,
          errors: failed.map(f => f.error),
        },
        timestamp: new Date().toISOString(),
      })

      // Consider scan successful if at least one agent succeeded
      if (successful.length > 0) {
        await callbacks.onStatusChange('completed')
        return { 
          success: true,
          error: failed.length > 0 ? `Partial success: ${failed.map(f => f.error).join('; ')}` : undefined,
        }
      } else {
        await callbacks.onStatusChange('failed')
        return { 
          success: false, 
          error: failed.map(f => f.error).join('; '),
        }
      }
    } catch (error) {
      await callbacks.onLog({
        agent_type: 'LangGraph Orchestrator',
        message: `Scan failed: ${error}`,
        status: 'error',
        details: { error: String(error) },
        timestamp: new Date().toISOString(),
      })

      await callbacks.onStatusChange('failed')
      return { success: false, error: String(error) }
    }
  }

  getAvailableAgents(): Array<{ type: ScanType; name: string; description: string }> {
    return Array.from(this.agents.entries()).map(([type, agent]) => ({
      type: type as ScanType,
      name: agent.getName(),
      description: agent.getDescription(),
    }))
  }
}

// Singleton instance
let langGraphOrchestratorInstance: LangGraphOrchestrator | null = null

export function getLangGraphOrchestrator(): LangGraphOrchestrator {
  if (!langGraphOrchestratorInstance) {
    langGraphOrchestratorInstance = new LangGraphOrchestrator()
  }
  return langGraphOrchestratorInstance
}
