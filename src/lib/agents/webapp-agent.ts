import { BaseAgent, AgentContext } from './base-agent'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { SQL_INJECTION_PAYLOADS, SQL_ERROR_SIGNATURES, XSS_PAYLOADS, SENSITIVE_FILES, HTTP_METHODS_TO_TEST } from './payloads'

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
      await this.testDirectoryEnumeration(context, url)
      await this.testSensitiveFiles(context, url)
      await this.testAuthenticationBypass(context, url)

      await this.log(context, 'Web application test completed', 'completed')
    } catch (error) {
      await this.log(context, `Web app test error: ${error}`, 'error', { error: String(error) })
    }
  }

  private async testSecurityHeaders(context: AgentContext, url: string) {
    const tools = this.getToolsForAgent('webapp')
    const headerTool = tools.find(t => t.name === 'Axios' || t.features.includes('Header Analysis'))
    
    if (headerTool) {
      await this.logToolUsage(context, headerTool, 'starting', { test: 'security-headers' })
    }
    await this.log(context, 'Checking security headers and SSL/TLS configuration', 'running')

    try {
      const response = await axios.head(url, {
        timeout: 10000,
        validateStatus: () => true,
        maxRedirects: 0, // Don't follow redirects to test original response
      })

      const headers = response.headers
      const missingHeaders = []

      // Check TLS version and certificate (if HTTPS)
      if (url.startsWith('https://')) {
        try {
          const tlsResponse = await axios.get(url, {
            timeout: 5000,
            validateStatus: () => true,
            httpsAgent: new (require('https')).Agent({
              rejectUnauthorized: false, // Allow self-signed for testing
            }),
          })
          
          // Check for weak TLS
          const protocol = tlsResponse.request?.socket?.getProtocol?.()
          if (protocol && (protocol.includes('TLSv1.0') || protocol.includes('TLSv1.1'))) {
            await this.reportFinding(context, {
              title: 'Weak TLS Version Detected',
              description: `Server supports ${protocol} which has known vulnerabilities. Update to TLS 1.2 or 1.3.`,
              severity: 'high',
              affected_asset: url,
              evidence: {
                protocol: protocol,
                recommendation: 'Disable TLSv1.0 and TLSv1.1, enforce TLS 1.2+',
              },
              cwe_id: 'CWE-327',
            })
          }
        } catch (tlsError) {
          // TLS check failed, but don't fail the whole test
        }
      }

      // Enhanced header checks with more details

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
      
      if (headerTool) {
        await this.logToolUsage(context, headerTool, 'completed', { 
          result: `${missingHeaders.length} missing security headers`,
          missingHeaders 
        })
      }
    } catch (error) {
      await this.log(context, `Security headers check error: ${error}`, 'error')
    }
  }

  private async testSQLInjection(context: AgentContext, url: string) {
    const tools = this.getToolsForAgent('webapp')
    const sqlTool = tools.find(t => t.name.includes('SQL Injection') || t.features.includes('SQL Injection'))
    
    if (sqlTool) {
      await this.logToolUsage(context, sqlTool, 'starting', { payloads: SQL_INJECTION_PAYLOADS.length })
    }
    await this.log(context, 'Testing for SQL injection vulnerabilities', 'running')

    // Use comprehensive payload list
    const sqlPayloads = SQL_INJECTION_PAYLOADS.slice(0, 8) // Use first 8 for speed
    const errorSignatures = SQL_ERROR_SIGNATURES

    try {
      // Parse URL to get base and query params
      const urlObj = new URL(url)
      
      // Only test if there are query parameters
      if (urlObj.searchParams.toString()) {
        const vulnerableParams = []

        for (const [param, value] of urlObj.searchParams) {
          for (const payload of sqlPayloads) {
            try {
              const testUrl = new URL(url)
              testUrl.searchParams.set(param, payload)

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
                vulnerableParams.push({ param, payload })
                
                await this.reportFinding(context, {
                  title: `SQL Injection Vulnerability Detected`,
                  description: `Parameter '${param}' appears vulnerable to SQL injection. The application returned SQL error messages when injecting: ${payload}`,
                  severity: 'critical',
                  affected_asset: `${url}?${param}=...`,
                  evidence: {
                    parameter: param,
                    payload: payload,
                    detection_method: 'Error-based detection',
                    matched_signatures: errorSignatures.filter(sig => responseText.includes(sig.toLowerCase())),
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
    
    if (sqlTool) {
      await this.logToolUsage(context, sqlTool, 'completed', { result: 'Scan completed' })
    }
  }

  private async testXSS(context: AgentContext, url: string) {
    const tools = this.getToolsForAgent('webapp')
    const xssTool = tools.find(t => t.name === 'XSS Tester' || t.features.includes('XSS Detection'))
    
    if (xssTool) {
      await this.logToolUsage(context, xssTool, 'starting', { payloads: XSS_PAYLOADS.length })
    }
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
      const vulnerabilities = []

      // Check if user input is reflected in the page
      const urlObj = new URL(url)
      if (urlObj.searchParams.toString()) {
        // Use comprehensive XSS payloads
        const xssPayloads = XSS_PAYLOADS.slice(0, 8) // Test first 8 for speed

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
                    payload_type: payload.includes('script') ? 'Script injection' : 'Event handler injection',
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
    
    if (xssTool) {
      await this.logToolUsage(context, xssTool, 'completed', { result: 'XSS scan completed' })
    }
  }

  private async testCSRF(context: AgentContext, url: string) {
    const tools = this.getToolsForAgent('webapp')
    const csrfTool = tools.find(t => t.name === 'CSRF Tester' || t.features.includes('CSRF Detection'))
    
    if (csrfTool) {
      await this.logToolUsage(context, csrfTool, 'starting', { test: 'csrf-token-validation' })
    }
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
      
      if (csrfTool) {
        await this.logToolUsage(context, csrfTool, 'completed', { result: 'CSRF validation completed' })
      }
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

  private async testDirectoryEnumeration(context: AgentContext, url: string) {
    await this.log(context, 'Testing for common directories and endpoints', 'running')

    const commonDirectories = [
      '/admin', '/administrator', '/wp-admin', '/phpmyadmin',
      '/backup', '/backups', '/old', '/test', '/dev', '/staging',
      '/api', '/rest', '/graphql', '/swagger', '/docs',
      '/.git', '/.svn', '/.env', '/config', '/uploads'
    ]

    let foundDirectories = 0

    for (const dir of commonDirectories) {
      try {
        const testUrl = new URL(url)
        testUrl.pathname = dir
        
        const response = await axios.get(testUrl.toString(), {
          timeout: 5000,
          validateStatus: () => true,
          maxRedirects: 0
        })

        if (response.status === 200 || response.status === 301 || response.status === 302) {
          foundDirectories++
          
          let severity: 'critical' | 'high' | 'medium' | 'low' = 'medium'
          if (dir.includes('admin') || dir.includes('.git') || dir.includes('.env')) {
            severity = 'critical'
          } else if (dir.includes('backup') || dir.includes('config')) {
            severity = 'high'
          }

          await this.reportFinding(context, {
            title: `Exposed Directory: ${dir}`,
            description: `Found publicly accessible directory at ${dir}. Status: ${response.status}`,
            severity,
            affected_asset: testUrl.toString(),
            evidence: {
              path: dir,
              status_code: response.status,
              content_type: response.headers['content-type']
            },
            cwe_id: 'CWE-200'
          })
        }
      } catch (error) {
        // Directory not found or error, continue
      }
    }

    await this.log(context, `Directory enumeration completed. Found ${foundDirectories} accessible directories`, 'completed')
  }

  private async testSensitiveFiles(context: AgentContext, url: string) {
    await this.log(context, 'Searching for sensitive files', 'running')

    const sensitiveFiles = [
      '/.env', '/.env.local', '/.env.production',
      '/config.php', '/config.yml', '/database.yml',
      '/backup.sql', '/dump.sql', '/database.sql',
      '/phpinfo.php', '/info.php',
      '/.git/config', '/.git/HEAD',
      '/composer.json', '/package.json', '/yarn.lock',
      '/.aws/credentials', '/.ssh/id_rsa',
      '/web.config', '/WEB-INF/web.xml'
    ]

    let foundFiles = 0

    for (const file of sensitiveFiles) {
      try {
        const testUrl = new URL(url)
        testUrl.pathname = file
        
        const response = await axios.get(testUrl.toString(), {
          timeout: 5000,
          validateStatus: () => true,
          maxRedirects: 0
        })

        if (response.status === 200 && response.data) {
          foundFiles++
          
          await this.reportFinding(context, {
            title: `Sensitive File Exposed: ${file}`,
            description: `Found sensitive file at ${file} that should not be publicly accessible.`,
            severity: 'critical',
            affected_asset: testUrl.toString(),
            evidence: {
              file: file,
              status_code: response.status,
              content_length: response.data.length,
              preview: response.data.substring(0, 200)
            },
            cwe_id: 'CWE-200',
            cvss_score: 9.1
          })
        }
      } catch (error) {
        // File not found, continue
      }
    }

    await this.log(context, `Sensitive file search completed. Found ${foundFiles} exposed files`, 'completed')
  }

  private async testAuthenticationBypass(context: AgentContext, url: string) {
    await this.log(context, 'Testing for authentication bypass vulnerabilities', 'running')

    try {
      // Test for SQL injection in login
      const loginPaths = ['/login', '/signin', '/auth', '/admin/login']
      
      for (const path of loginPaths) {
        try {
          const testUrl = new URL(url)
          testUrl.pathname = path
          
          // Check if login page exists
          const pageResponse = await axios.get(testUrl.toString(), {
            timeout: 5000,
            validateStatus: () => true
          })

          if (pageResponse.status === 200) {
            // Try SQL injection bypass
            const sqlBypass = [
              "' OR '1'='1",
              "admin'--",
              "' OR 1=1--"
            ]

            for (const payload of sqlBypass) {
              try {
                const response = await axios.post(testUrl.toString(), {
                  username: payload,
                  password: payload
                }, {
                  timeout: 5000,
                  validateStatus: () => true,
                  maxRedirects: 0
                })

                // Check if bypass was successful (redirect or success status)
                if (response.status === 302 || response.status === 200) {
                  const locationHeader = response.headers['location']
                  if (locationHeader && !locationHeader.includes('login') && !locationHeader.includes('error')) {
                    await this.reportFinding(context, {
                      title: 'SQL Injection Authentication Bypass',
                      description: `Authentication can be bypassed using SQL injection payload: ${payload}`,
                      severity: 'critical',
                      affected_asset: testUrl.toString(),
                      evidence: {
                        payload: payload,
                        response_status: response.status,
                        redirect_location: locationHeader
                      },
                      cwe_id: 'CWE-89',
                      cvss_score: 9.8
                    })
                  }
                }
              } catch (error) {
                // Error on injection attempt, continue
              }
            }
          }
        } catch (error) {
          // Login path doesn't exist, continue
        }
      }

      await this.log(context, 'Authentication bypass testing completed', 'completed')
    } catch (error) {
      await this.log(context, `Authentication bypass test error: ${error}`, 'error')
    }
  }
}