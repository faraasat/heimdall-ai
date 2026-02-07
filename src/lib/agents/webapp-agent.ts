import { BaseAgent, AgentContext } from './base-agent'
import axios from 'axios'
import * as cheerio from 'cheerio'

export class WebAppAgent extends BaseAgent {
  constructor() {
    super('Web Application Agent', 'Tests web application security (OWASP Top 10)')
  }

  async execute(context: AgentContext): Promise<void> {
    await this.log(context, 'Starting web application security test', 'running')

    try {
      const target = context.target

      // Ensure target has protocol
      const url = target.startsWith('http') ? target : `https://${target}`

      await this.log(context, `Testing ${url}`, 'running')

      // Test various OWASP Top 10 vulnerabilities
      await this.testSecurityHeaders(context, url)
      await this.testSQLInjection(context, url)
      await this.testXSS(context, url)
      await this.testCSRF(context, url)
      await this.testSSL(context, url)

      await this.log(context, 'Web application test completed', 'completed')
    } catch (error) {
      await this.log(context, `Web app test error: ${error}`, 'error', { error: String(error) })
    }
  }

  private async testSecurityHeaders(context: AgentContext, url: string) {
    await this.log(context, 'Checking security headers', 'running')

    try {
      const response = await axios.head(url, {
        timeout: 10000,
        validateStatus: () => true,
      })

      const headers = response.headers
      const missingHeaders = []

      // Check for important security headers
      if (!headers['x-frame-options']) {
        missingHeaders.push('X-Frame-Options')
        await this.reportFinding(context, {
          title: 'Missing X-Frame-Options Header',
          description: 'The X-Frame-Options header is not set, making the application vulnerable to clickjacking attacks.',
          severity: 'medium',
          affected_asset: url,
          evidence: {
            headers: Object.keys(headers),
            missing_header: 'X-Frame-Options',
          },
          cwe_id: 'CWE-1021',
        })
      }

      if (!headers['content-security-policy']) {
        missingHeaders.push('Content-Security-Policy')
        await this.reportFinding(context, {
          title: 'Missing Content-Security-Policy Header',
          description: 'CSP header is not implemented, which helps prevent XSS and other code injection attacks.',
          severity: 'high',
          affected_asset: url,
          evidence: {
            headers: Object.keys(headers),
            missing_header: 'Content-Security-Policy',
          },
          cwe_id: 'CWE-1021',
        })
      }

      if (!headers['strict-transport-security']) {
        missingHeaders.push('Strict-Transport-Security')
        await this.reportFinding(context, {
          title: 'Missing Strict-Transport-Security Header',
          description: 'HSTS header is not configured, allowing potential man-in-the-middle attacks.',
          severity: 'medium',
          affected_asset: url,
          evidence: {
            headers: Object.keys(headers),
            missing_header: 'Strict-Transport-Security',
          },
          cwe_id: 'CWE-319',
        })
      }

      if (!headers['x-content-type-options']) {
        missingHeaders.push('X-Content-Type-Options')
        await this.reportFinding(context, {
          title: 'Missing X-Content-Type-Options Header',
          description: 'The X-Content-Type-Options header is not set, allowing MIME-sniffing attacks.',
          severity: 'low',
          affected_asset: url,
          evidence: {
            headers: Object.keys(headers),
            missing_header: 'X-Content-Type-Options',
          },
        })
      }

      await this.log(context, `Security headers check completed. Missing: ${missingHeaders.length}`, 'completed')
    } catch (error) {
      await this.log(context, `Security headers check error: ${error}`, 'error')
    }
  }

  private async testSQLInjection(context: AgentContext, url: string) {
    await this.log(context, 'Testing for SQL injection vulnerabilities', 'running')

    // SQL injection payloads and their error signatures
    const sqlPayloads = [
      { payload: "'", name: 'Single quote' },
      { payload: "1' OR '1'='1", name: 'Classic OR bypass' },
      { payload: "admin'--", name: 'Comment injection' },
      { payload: "1' AND '1'='2", name: 'Boolean-based blind' },
    ]

    const errorSignatures = [
      'sql syntax',
      'mysql_fetch',
      'postgresql',
      'ora-',
      'sqlite',
      'sqlstate',
      'unclosed quotation',
      'quoted string not properly terminated',
    ]

    try {
      // Parse URL to get base and query params
      const urlObj = new URL(url)
      
      // Only test if there are query parameters
      if (urlObj.searchParams.toString()) {
        let vulnerableParams = []

        for (const [param, value] of urlObj.searchParams) {
          for (const sqlTest of sqlPayloads) {
            try {
              const testUrl = new URL(url)
              testUrl.searchParams.set(param, sqlTest.payload)

              const response = await axios.get(testUrl.toString(), {
                timeout: 10000,
                validateStatus: () => true,
              })

              const responseText = response.data.toString().toLowerCase()
              
              // Check for SQL error messages
              const hasErrorSignature = errorSignatures.some(sig => 
                responseText.includes(sig.toLowerCase())
              )

              if (hasErrorSignature) {
                vulnerableParams.push({ param, payload: sqlTest.name })
                
                await this.reportFinding(context, {
                  title: `SQL Injection Vulnerability Detected`,
                  description: `Parameter '${param}' appears vulnerable to SQL injection. The application returned SQL error messages when injecting: ${sqlTest.name}`,
                  severity: 'critical',
                  affected_asset: `${url}?${param}=...`,
                  evidence: {
                    parameter: param,
                    payload: sqlTest.payload,
                    detection_method: 'Error-based detection',
                  },
                  cwe_id: 'CWE-89',
                  cvss_score: 9.1,
                })
                break // Found vulnerability in this param, move to next
              }
            } catch (error) {
              // Request failed, continue
            }
          }
        }

        if (vulnerableParams.length === 0) {
          await this.log(context, 'No SQL injection vulnerabilities detected in query parameters', 'completed')
        }
      } else {
        await this.log(context, 'No query parameters found to test for SQL injection', 'completed')
      }
    } catch (error) {
      await this.log(context, `SQL injection test error: ${error}`, 'error')
    }

    await this.log(context, 'SQL injection test completed', 'completed')
  }

  private async testXSS(context: AgentContext, url: string) {
    await this.log(context, 'Testing for Cross-Site Scripting (XSS)', 'running')

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        validateStatus: () => true,
      })

      const $ = cheerio.load(response.data)

      // Look for potential XSS vectors
      const inputFields = $('input, textarea')
      const forms = $('form')
      let vulnerabilities = []

      // Check if user input is reflected in the page
      const urlObj = new URL(url)
      if (urlObj.searchParams.toString()) {
        // Test XSS payloads
        const xssPayloads = [
          '<script>alert(1)</script>',
          '"><script>alert(1)</script>',
          "'><script>alert(1)</script>",
          '<img src=x onerror=alert(1)>',
        ]

        for (const [param, value] of urlObj.searchParams) {
          for (const payload of xssPayloads) {
            try {
              const testUrl = new URL(url)
              testUrl.searchParams.set(param, payload)

              const testResponse = await axios.get(testUrl.toString(), {
                timeout: 10000,
                validateStatus: () => true,
              })

              // Check if payload is reflected unescaped
              if (testResponse.data.includes(payload)) {
                vulnerabilities.push(param)
                
                await this.reportFinding(context, {
                  title: `Reflected XSS Vulnerability in ${param}`,
                  description: `Parameter '${param}' reflects user input without proper sanitization. Successfully injected: ${payload}`,
                  severity: 'high',
                  affected_asset: `${url}?${param}=...`,
                  evidence: {
                    parameter: param,
                    payload: payload,
                    reflected: true,
                  },
                  cwe_id: 'CWE-79',
                  cvss_score: 7.2,
                })
                break // Found vulnerability, move to next param
              }
            } catch (error) {
              // Request failed, continue
            }
          }
        }
      }

      // Check for unsafe inline JavaScript in HTML
      const inlineScripts = $('script:not([src])')
      if (inlineScripts.length > 0) {
        const hasUserInput = inlineScripts.toArray().some((script) => {
          const content = $(script).html() || ''
          return content.includes('innerHTML') || content.includes('document.write')
        })

        if (hasUserInput) {
          await this.reportFinding(context, {
            title: 'Potentially Unsafe DOM Manipulation',
            description: `Found ${inlineScripts.length} inline scripts using potentially unsafe DOM manipulation methods like innerHTML or document.write`,
            severity: 'medium',
            affected_asset: url,
            evidence: {
              inline_scripts: inlineScripts.length,
              methods_found: ['innerHTML', 'document.write'],
            },
            cwe_id: 'CWE-79',
          })
        }
      }

      if (vulnerabilities.length === 0 && inputFields.length > 0) {
        await this.log(context, `Found ${inputFields.length} input fields. No XSS vulnerabilities detected in URL parameters`, 'completed')
      }
    } catch (error) {
      await this.log(context, `XSS test error: ${error}`, 'error')
    }

    await this.log(context, 'XSS test completed', 'completed')
  }

  private async testCSRF(context: AgentContext, url: string) {
    await this.log(context, 'Testing for CSRF protection', 'running')

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        validateStatus: () => true,
      })

      const $ = cheerio.load(response.data)
      const forms = $('form')

      let formsWithoutToken = 0

      forms.each((i, form) => {
        const hasCSRFToken = $(form).find('input[name*="csrf"], input[name*="token"]').length > 0
        if (!hasCSRFToken) {
          formsWithoutToken++
        }
      })

      if (formsWithoutToken > 0) {
        await this.reportFinding(context, {
          title: 'Missing CSRF Protection',
          description: `Found ${formsWithoutToken} forms without apparent CSRF tokens. This may allow cross-site request forgery attacks.`,
          severity: 'high',
          affected_asset: url,
          evidence: {
            total_forms: forms.length,
            forms_without_token: formsWithoutToken,
          },
          cwe_id: 'CWE-352',
          cvss_score: 6.5,
        })
      }

      await this.log(context, 'CSRF test completed', 'completed')
    } catch (error) {
      await this.log(context, `CSRF test error: ${error}`, 'error')
    }
  }

  private async testSSL(context: AgentContext, url: string) {
    await this.log(context, 'Testing SSL/TLS configuration', 'running')

    try {
      if (url.startsWith('http://')) {
        await this.reportFinding(context, {
          title: 'Insecure HTTP Connection',
          description: 'The application is accessible over unencrypted HTTP. All traffic should use HTTPS.',
          severity: 'critical',
          affected_asset: url,
          evidence: {
            protocol: 'HTTP',
            recommendation: 'Implement HTTPS and redirect all HTTP traffic',
          },
          cwe_id: 'CWE-319',
          cvss_score: 8.2,
        })
      }

      await this.log(context, 'SSL/TLS test completed', 'completed')
    } catch (error) {
      await this.log(context, `SSL test error: ${error}`, 'error')
    }
  }
}
