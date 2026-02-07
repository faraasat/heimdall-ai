import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages"
import { getAIModel } from "./models"
import type { FindingSeverity } from "../types/database"

export interface VulnerabilityAnalysis {
  severity: FindingSeverity
  confidence: number
  reasoning: string[]
  exploitability: 'high' | 'medium' | 'low'
  false_positive_likelihood: number
}

export interface RemediationGuidance {
  steps: string[]
  code_examples?: string[]
  estimated_effort: string
  priority: string
  verification_steps?: string[]
}

export async function analyzeVulnerability(
  vulnerability: {
    title: string
    description: string
    evidence: any
    cvss_score?: number
  }
): Promise<VulnerabilityAnalysis> {
  const model = await getAIModel('groq', { temperature: 0.2 })

  const prompt = `You are a security expert analyzing a vulnerability. Provide a detailed assessment.

Vulnerability Information:
Title: ${vulnerability.title}
Description: ${vulnerability.description}
CVSS Score: ${vulnerability.cvss_score || 'N/A'}
Evidence: ${JSON.stringify(vulnerability.evidence, null, 2)}

Analyze this vulnerability and provide:
1. Severity assessment (critical, high, medium, low, info)
2. Confidence level (0-100%)
3. Step-by-step reasoning
4. Exploitability assessment (high, medium, low)
5. Likelihood this is a false positive (0-100%)

Respond in JSON format:
{
  "severity": "high",
  "confidence": 85,
  "reasoning": ["step1", "step2", ...],
  "exploitability": "high",
  "false_positive_likelihood": 10
}`

  try {
    const response = await model.invoke([new HumanMessage(prompt)])
    const content = response.content as string
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])
      return analysis
    }
    
    // Fallback if parsing fails
    return {
      severity: 'medium',
      confidence: 50,
      reasoning: ['Analysis parsing failed, using default assessment'],
      exploitability: 'medium',
      false_positive_likelihood: 50,
    }
  } catch (error) {
    console.error('Error analyzing vulnerability:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      severity: 'medium',
      confidence: 30,
      reasoning: [
        'AI analysis failed.',
        `Error: ${errorMessage}`,
        'Please check API keys (GROQ_API_KEY or GOOGLE_AI_API_KEY) and try again.'
      ],
      exploitability: 'medium',
      false_positive_likelihood: 50,
    }
  }
}

export async function generateRemediation(
  finding: {
    title: string
    description: string
    severity: string
    affected_asset: string
  }
): Promise<RemediationGuidance> {
  const model = await getAIModel('groq', { temperature: 0.3 })

  const prompt = `You are a security expert providing remediation guidance.

Vulnerability:
Title: ${finding.title}
Description: ${finding.description}
Severity: ${finding.severity}
Affected Asset: ${finding.affected_asset}

Provide detailed remediation guidance including:
1. Step-by-step remediation steps
2. Code examples if applicable
3. Estimated effort (e.g., "2-4 hours", "1 day", "1 week")
4. Priority level (immediate, high, medium, low)
5. Verification steps to confirm the fix

Respond in JSON format:
{
  "steps": ["step1", "step2", ...],
  "code_examples": ["example1", ...],
  "estimated_effort": "2-4 hours",
  "priority": "high",
  "verification_steps": ["verify1", ...]
}`

  try {
    const response = await model.invoke([new HumanMessage(prompt)])
    const content = response.content as string
    
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const guidance = JSON.parse(jsonMatch[0])
      return guidance
    }
    
    return {
      steps: ['Review the vulnerability details', 'Apply security best practices', 'Test the fix'],
      estimated_effort: 'Unknown',
      priority: 'medium',
    }
  } catch (error) {
    console.error('Error generating remediation:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      steps: [
        'AI remediation guidance failed.',
        `Error: ${errorMessage}`,
        'Manual review recommended. Check API configuration.'
      ],
      estimated_effort: 'Unknown',
      priority: 'medium',
    }
  }
}

export async function parseNaturalLanguageScanRequest(userInput: string): Promise<{
  scan_type: string
  target: string
  config: Record<string, any>
}> {
  const model = await getAIModel('gemini', { temperature: 0.1 })

  const prompt = `Parse this user request into a scan configuration.

User Input: "${userInput}"

Extract:
1. Scan type: network, webapp, api, cloud, iot, or config
2. Target: URL, IP address, or identifier
3. Additional configuration options

Respond in JSON format:
{
  "scan_type": "webapp",
  "target": "https://example.com",
  "config": {}
}

Valid scan types: network, webapp, api, cloud, iot, config`

  try {
    const response = await model.invoke([new HumanMessage(prompt)])
    const content = response.content as string
    
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    // Default fallback
    return {
      scan_type: 'webapp',
      target: userInput,
      config: {},
    }
  } catch (error) {
    console.error('Error parsing natural language:', error)
    return {
      scan_type: 'webapp',
      target: userInput,
      config: {},
    }
  }
}
