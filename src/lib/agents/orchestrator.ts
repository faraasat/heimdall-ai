import { NetworkAgent } from './network-agent'
import { WebAppAgent } from './webapp-agent'
import { APIAgent } from './api-agent'
import { CloudAgent } from './cloud-agent'
import { IoTAgent } from './iot-agent'
import { ConfigAgent } from './config-agent'
import { BaseAgent, AgentContext } from './base-agent'
import type { ScanType, AgentActivityLog, Finding } from '../types/database'

export class AgentOrchestrator {
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

  async executeScan(
    scanId: string,
    scanType: ScanType,
    target: string,
    config: Record<string, any>,
    callbacks: {
      onLog: (log: Omit<AgentActivityLog, 'id' | 'scan_id'>) => Promise<void>
      onFinding: (finding: Omit<Finding, 'id' | 'scan_id' | 'created_at' | 'updated_at'>) => Promise<void>
      onStatusChange: (status: 'running' | 'completed' | 'failed') => Promise<void>
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update status to running
      await callbacks.onStatusChange('running')

      // Log orchestrator start
      await callbacks.onLog({
        agent_type: 'Orchestrator',
        message: `Initiating ${scanType} scan for ${target}`,
        status: 'running',
        details: { scan_type: scanType, target },
        timestamp: new Date().toISOString(),
      })

      // Get the appropriate agent
      const agent = this.agents.get(scanType)
      if (!agent) {
        throw new Error(`No agent found for scan type: ${scanType}`)
      }

      // Create agent context
      const context: AgentContext = {
        scanId,
        target,
        config,
        onLog: callbacks.onLog,
        onFinding: callbacks.onFinding,
      }

      // Log agent selection
      await callbacks.onLog({
        agent_type: 'Orchestrator',
        message: `Selected ${agent.getName()} for execution`,
        status: 'running',
        details: { agent: agent.getName() },
        timestamp: new Date().toISOString(),
      })

      // Execute the agent
      await agent.execute(context)

      // Log completion
      await callbacks.onLog({
        agent_type: 'Orchestrator',
        message: 'Scan completed successfully',
        status: 'completed',
        details: {},
        timestamp: new Date().toISOString(),
      })

      // Update final status
      await callbacks.onStatusChange('completed')

      return { success: true }
    } catch (error) {
      // Log error
      await callbacks.onLog({
        agent_type: 'Orchestrator',
        message: `Scan failed: ${error}`,
        status: 'error',
        details: { error: String(error) },
        timestamp: new Date().toISOString(),
      })

      // Update status to failed
      await callbacks.onStatusChange('failed')

      return { success: false, error: String(error) }
    }
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
        agent_type: 'Orchestrator',
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
        agent_type: 'Orchestrator',
        message: `Initiating multi-scan (${scanTypes.join(', ')}) for ${target}`,
        status: 'running',
        details: { scan_types: scanTypes, target },
        timestamp: new Date().toISOString(),
      })

      for (const scanType of scanTypes) {
        await callbacks.onLog({
          agent_type: 'Orchestrator',
          message: `Starting ${scanType} agent`,
          status: 'running',
          details: { scan_type: scanType },
          timestamp: new Date().toISOString(),
        })

        const agent = this.agents.get(scanType)
        if (!agent) {
          throw new Error(`No agent found for scan type: ${scanType}`)
        }

        const context: AgentContext = {
          scanId,
          target,
          config,
          onLog: callbacks.onLog,
          onFinding: callbacks.onFinding,
        }

        await callbacks.onLog({
          agent_type: 'Orchestrator',
          message: `Selected ${agent.getName()} for execution`,
          status: 'running',
          details: { agent: agent.getName(), scan_type: scanType },
          timestamp: new Date().toISOString(),
        })

        await agent.execute(context)

        await callbacks.onLog({
          agent_type: 'Orchestrator',
          message: `${scanType} agent completed`,
          status: 'completed',
          details: { scan_type: scanType },
          timestamp: new Date().toISOString(),
        })
      }

      await callbacks.onLog({
        agent_type: 'Orchestrator',
        message: 'All selected scan types completed successfully',
        status: 'completed',
        details: { scan_types: scanTypes },
        timestamp: new Date().toISOString(),
      })

      await callbacks.onStatusChange('completed')
      return { success: true }
    } catch (error) {
      await callbacks.onLog({
        agent_type: 'Orchestrator',
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
let orchestratorInstance: AgentOrchestrator | null = null

export function getOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator()
  }
  return orchestratorInstance
}
