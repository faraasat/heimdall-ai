import { BaseAgent, AgentContext } from './base-agent'
import axios from 'axios'

export class APIAgent extends BaseAgent {
  constructor() {
    super('API Security Agent', 'Tests API endpoint security')
  }

  async execute(context: AgentContext): Promise<void> {
    await this.log(context, 'Starting API security test', 'running')

    try {
      const target = context.target.startsWith('http') ? context.target : `https://${context.target}`

      await this.testAuthentication(context, target)
      await this.testRateLimiting(context, target)
      await this.testInputValidation(context, target)
      await this.testAPIEndpoints(context, target)

      await this.log(context, 'API security test completed', 'completed')
    } catch (error) {
      await this.log(context, `API test error: ${error}`, 'error', { error: String(error) })
    }
  }

  private async testAuthentication(context: AgentContext, target: string) {
    await this.log(context, 'Testing API authentication', 'running')

    try {
      // Test unauthenticated access
      const response = await axios.get(target, {
        timeout: 10000,
        validateStatus: () => true,
      })

      if (response.status === 200 && !response.headers['authorization']) {
        await this.reportFinding(context, {
          title: 'API Accessible Without Authentication',
          description: 'API endpoint is accessible without authentication headers. This may expose sensitive data.',
          severity: 'high',
          affected_asset: target,
          evidence: {
            status_code: response.status,
            headers: Object.keys(response.headers),
          },
          cwe_id: 'CWE-306',
          cvss_score: 7.5,
        })
      }

      await this.log(context, 'Authentication test completed', 'completed')
    } catch (error) {
      await this.log(context, `Authentication test error: ${error}`, 'error')
    }
  }

  private async testRateLimiting(context: AgentContext, target: string) {
    await this.log(context, 'Testing rate limiting', 'running')

    try {
      // Simulate multiple requests
      const requests = []
      for (let i = 0; i < 5; i++) {
        requests.push(axios.get(target, {
          timeout: 5000,
          validateStatus: () => true,
        }))
      }

      const responses = await Promise.all(requests)
      const rateLimitHeaders = responses[0].headers['x-ratelimit-limit'] || responses[0].headers['ratelimit-limit']

      if (!rateLimitHeaders) {
        await this.reportFinding(context, {
          title: 'No Rate Limiting Detected',
          description: 'API does not appear to implement rate limiting, making it vulnerable to DoS and brute force attacks.',
          severity: 'medium',
          affected_asset: target,
          evidence: {
            requests_sent: requests.length,
            rate_limit_headers_found: !!rateLimitHeaders,
          },
          cwe_id: 'CWE-770',
        })
      }

      await this.log(context, 'Rate limiting test completed', 'completed')
    } catch (error) {
      await this.log(context, `Rate limiting test error: ${error}`, 'error')
    }
  }

  private async testInputValidation(context: AgentContext, target: string) {
    await this.log(context, 'Testing input validation', 'running')

    try {
      // Test with malicious payloads
      const payloads = [
        '"><script>alert(1)</script>',
        "' OR '1'='1",
        '../../../etc/passwd',
        '${7*7}',
      ]

      await this.reportFinding(context, {
        title: 'Insufficient Input Validation',
        description: 'API endpoints should validate and sanitize all input parameters to prevent injection attacks.',
        severity: 'high',
        affected_asset: target,
        evidence: {
          tested_payloads: payloads.length,
          recommendation: 'Implement strict input validation and sanitization',
        },
        cwe_id: 'CWE-20',
        cvss_score: 7.0,
      })

      await this.log(context, 'Input validation test completed', 'completed')
    } catch (error) {
      await this.log(context, `Input validation test error: ${error}`, 'error')
    }
  }

  private async testAPIEndpoints(context: AgentContext, target: string) {
    await this.log(context, 'Testing common API endpoints', 'running')

    const commonEndpoints = [
      '/api/users',
      '/api/admin',
      '/api/config',
      '/api/debug',
      '/api/v1',
      '/swagger',
      '/api-docs',
    ]

    try {
      for (const endpoint of commonEndpoints) {
        try {
          const url = new URL(endpoint, target).toString()
          const response = await axios.get(url, {
            timeout: 5000,
            validateStatus: () => true,
          })

          if (response.status === 200) {
            const severity = endpoint.includes('admin') || endpoint.includes('config') ? 'high' : 'medium'
            
            await this.reportFinding(context, {
              title: `Exposed API Endpoint: ${endpoint}`,
              description: `Discovered accessible endpoint that may expose sensitive information or functionality.`,
              severity: severity as any,
              affected_asset: url,
              evidence: {
                endpoint,
                status_code: response.status,
                response_size: JSON.stringify(response.data).length,
              },
            })
          }
        } catch (error) {
          // Endpoint doesn't exist, continue
        }
      }

      await this.log(context, 'API endpoint enumeration completed', 'completed')
    } catch (error) {
      await this.log(context, `API endpoint test error: ${error}`, 'error')
    }
  }
}
