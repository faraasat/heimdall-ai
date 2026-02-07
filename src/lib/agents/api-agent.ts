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
    const tools = this.getToolsForAgent('api')
    const authTool = tools.find(t => t.features.includes('Auth Testing') || t.name.includes('JWT'))
    
    if (authTool) {
      await this.logToolUsage(context, authTool, 'starting', { test: 'authentication' })
    }
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
      
      if (authTool) {
        await this.logToolUsage(context, authTool, 'completed', { result: 'Authentication scan completed' })
      }
    } catch (error) {
      await this.log(context, `Authentication test error: ${error}`, 'error')
    }
  }

  private async testRateLimiting(context: AgentContext, target: string) {
    const tools = this.getToolsForAgent('api')
    const rateLimitTool = tools.find(t => t.name.includes('Load Test') || t.name.includes('Artillery') || t.name === 'Supertest')
    
    if (rateLimitTool) {
      await this.logToolUsage(context, rateLimitTool, 'starting', { requests: 5 })
    }
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
      
      if (rateLimitTool) {
        await this.logToolUsage(context, rateLimitTool, 'completed', { 
          result: rateLimitHeaders ? 'Rate limiting detected' : 'No rate limiting found'
        })
      }
    } catch (error) {
      await this.log(context, `Rate limiting test error: ${error}`, 'error')
    }
  }

  private async testInputValidation(context: AgentContext, target: string) {
    const tools = this.getToolsForAgent('api')
    const validationTool = tools.find(t => t.name.includes('OpenAPI') || t.name === 'Supertest' || t.name === 'Frisby')
    
    if (validationTool) {
      await this.logToolUsage(context, validationTool, 'starting', { payloads: 5 })
    }
    await this.log(context, 'Testing input validation', 'running')

    try {
      // Test with various malicious payloads
      const payloads = [
        { payload: '"><script>alert(1)</script>', type: 'XSS', severity: 'high' as const },
        { payload: "' OR '1'='1", type: 'SQL Injection', severity: 'critical' as const },
        { payload: '../../../etc/passwd', type: 'Path Traversal', severity: 'high' as const },
        { payload: '${7*7}', type: 'Template Injection', severity: 'high' as const },
        { payload: '<xml><!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>', type: 'XXE', severity: 'high' as const },
      ]

      const vulnerableToPayloads = []

      for (const test of payloads) {
        try {
          // Test as query parameter
          const testUrl = `${target}${target.includes('?') ? '&' : '?'}test=${encodeURIComponent(test.payload)}`
          
          const response = await axios.get(testUrl, {
            timeout: 5000,
            validateStatus: () => true,
          })

          // Check if payload is reflected without encoding
          if (response.data.toString().includes(test.payload)) {
            vulnerableToPayloads.push(test.type)
            
            await this.reportFinding(context, {
              title: `Insufficient Input Validation - ${test.type}`,
              description: `API reflects ${test.type} payload without proper sanitization or encoding. This indicates insufficient input validation.`,
              severity: test.severity,
              affected_asset: target,
              evidence: {
                payload_type: test.type,
                payload: test.payload,
                reflected: true,
              },
              cwe_id: 'CWE-20',
              cvss_score: test.severity === 'critical' ? 9.1 : 7.5,
            })
          }

          // Also test as POST body if it's not the root
          if (target !== target.split('?')[0]) {
            try {
              const postResponse = await axios.post(target.split('?')[0], {
                test_param: test.payload,
              }, {
                timeout: 5000,
                validateStatus: () => true,
              })

              if (postResponse.data.toString().includes(test.payload)) {
                await this.reportFinding(context, {
                  title: `POST Body Input Validation Issue - ${test.type}`,
                  description: `API POST endpoint reflects malicious input without sanitization.`,
                  severity: test.severity,
                  affected_asset: target.split('?')[0],
                  evidence: {
                    method: 'POST',
                    payload_type: test.type,
                    reflected: true,
                  },
                  cwe_id: 'CWE-20',
                })
              }
            } catch (error) {
              // POST test failed, continue
            }
          }
        } catch (error) {
          // Request failed, continue with next payload
        }
      }

      if (vulnerableToPayloads.length === 0) {
        await this.log(context, 'No input validation issues detected with test payloads', 'completed')
      } else {
        await this.log(context, `Input validation issues found: ${vulnerableToPayloads.join(', ')}`, 'completed')
      }
    } catch (error) {
      await this.log(context, `Input validation test error: ${error}`, 'error')
    }

    await this.log(context, 'Input validation test completed', 'completed')
    
    if (validationTool) {
      await this.logToolUsage(context, validationTool, 'completed', { 
        result: `Tested ${payloads.length} payload types`,
        vulnerableToPayloads: vulnerableToPayloads.length > 0 ? vulnerableToPayloads : 'none'
      })
    }
  }

  private async testAPIEndpoints(context: AgentContext, target: string) {
    const tools = this.getToolsForAgent('api')
    const enumTool = tools.find(t => t.name.includes('GraphQL Inspector') || t.features.includes('API Discovery'))
    
    if (enumTool) {
      await this.logToolUsage(context, enumTool, 'starting', { endpoints: commonEndpoints.length })
    }
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
