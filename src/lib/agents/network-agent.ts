import { BaseAgent, AgentContext } from './base-agent'
import * as dns from 'dns'
import { promisify } from 'util'
import * as tcpPortUsed from 'tcp-port-used'
import axios from 'axios'

const resolveDns = promisify(dns.resolve)

export class NetworkAgent extends BaseAgent {
  constructor() {
    super('Network Penetration Agent', 'Tests network infrastructure and services')
  }

  async execute(context: AgentContext): Promise<void> {
    await this.log(context, 'Starting network penetration test', 'running')

    try {
      // Parse target to get hostname
      const target = context.target.replace(/^https?:\/\//, '').split('/')[0]
      
      await this.log(context, `Performing reconnaissance on ${target}`, 'running')

      // DNS Enumeration
      await this.performDNSEnumeration(context, target)

      // Port Scanning (simulated for demo - in production would use actual port scanning)
      await this.performPortScanning(context, target)

      // Service Detection
      await this.performServiceDetection(context, target)

      await this.log(context, 'Network penetration test completed', 'completed')
    } catch (error) {
      await this.log(context, `Network test error: ${error}`, 'error', { error: String(error) })
    }
  }

  private async performDNSEnumeration(context: AgentContext, target: string) {
    await this.log(context, 'Enumerating DNS records', 'running')

    try {
      // Try to resolve A records
      const addresses = await resolveDns(target, 'A').catch(() => [])
      
      if (addresses.length > 0) {
        await this.log(context, `Found ${addresses.length} A records`, 'completed', {
          addresses,
        })
      }

      // Check for common subdomains (demo purposes)
      const commonSubdomains = ['www', 'api', 'admin', 'dev', 'staging', 'test']
      
      for (const subdomain of commonSubdomains) {
        const fullDomain = `${subdomain}.${target}`
        try {
          const subAddresses = await resolveDns(fullDomain, 'A').catch(() => [])
          if (subAddresses.length > 0) {
            await this.reportFinding(context, {
              title: 'Subdomain Discovered',
              description: `Found subdomain: ${fullDomain} pointing to ${subAddresses.join(', ')}`,
              severity: 'info',
              affected_asset: fullDomain,
              evidence: {
                subdomain: fullDomain,
                addresses: subAddresses,
              },
            })
          }
        } catch (error) {
          // Subdomain doesn't exist, continue
        }
      }
    } catch (error) {
      await this.log(context, `DNS enumeration error: ${error}`, 'error')
    }
  }

  private async performPortScanning(context: AgentContext, target: string) {
    await this.log(context, 'Scanning common ports', 'running')

    // Real port scan of common ports
    const commonPorts = [
      { port: 21, service: 'FTP' },
      { port: 22, service: 'SSH' },
      { port: 23, service: 'Telnet' },
      { port: 25, service: 'SMTP' },
      { port: 80, service: 'HTTP' },
      { port: 443, service: 'HTTPS' },
      { port: 3306, service: 'MySQL' },
      { port: 5432, service: 'PostgreSQL' },
      { port: 6379, service: 'Redis' },
      { port: 27017, service: 'MongoDB' },
    ]

    const openPorts = []

    for (const portInfo of commonPorts) {
      try {
        const isOpen = await tcpPortUsed.check(portInfo.port, target)
        
        if (isOpen) {
          openPorts.push(portInfo)
          await this.log(context, `Port ${portInfo.port}/${portInfo.service} is open`, 'completed')

          // Determine severity based on port type
          let severity: 'critical' | 'high' | 'medium' | 'low' = 'medium'
          if ([3306, 5432, 6379, 27017].includes(portInfo.port)) {
            severity = 'high' // Database ports
          } else if (portInfo.port === 23) {
            severity = 'critical' // Telnet
          } else if ([21, 25].includes(portInfo.port)) {
            severity = 'high' // Unencrypted protocols
          }
          
          await this.reportFinding(context, {
            title: `Open ${portInfo.service} Port (${portInfo.port})`,
            description: `Port ${portInfo.port} running ${portInfo.service} service is publicly accessible${severity === 'high' || severity === 'critical' ? ' and may expose sensitive data' : ''}`,
            severity,
            affected_asset: `${target}:${portInfo.port}`,
            evidence: {
              port: portInfo.port,
              service: portInfo.service,
              state: 'open',
            },
            cwe_id: [3306, 5432, 6379, 27017].includes(portInfo.port) ? 'CWE-200' : undefined,
          })
        }
      } catch (error) {
        // Port is closed or unreachable, continue
      }
    }

    await this.log(context, `Found ${openPorts.length} open ports`, 'completed')
  }

  private async performServiceDetection(context: AgentContext, target: string) {
    await this.log(context, 'Detecting service versions and security configurations', 'running')

    // Real service detection via HTTP headers and banner grabbing
    try {
      const protocols = ['https', 'http']
      
      for (const protocol of protocols) {
        try {
          const response = await axios.head(`${protocol}://${target}`, {
            timeout: 5000,
            validateStatus: () => true,
          })

          // Check for server header
          const serverHeader = response.headers['server']
          const poweredBy = response.headers['x-powered-by']

          if (serverHeader) {
            await this.log(context, `Server: ${serverHeader}`, 'completed')
            
            // Check for version disclosure
            if (/\d+\.\d+/.test(serverHeader)) {
              await this.reportFinding(context, {
                title: 'Server Version Disclosure',
                description: `Server header reveals version information: ${serverHeader}. This helps attackers identify vulnerabilities.`,
                severity: 'low',
                affected_asset: target,
                evidence: {
                  header: 'Server',
                  value: serverHeader,
                },
                cwe_id: 'CWE-200',
              })
            }
          }

          if (poweredBy) {
            await this.log(context, `X-Powered-By: ${poweredBy}`, 'completed')
            
            await this.reportFinding(context, {
              title: 'Technology Stack Disclosure',
              description: `X-Powered-By header reveals technology: ${poweredBy}. Remove this header to reduce information leakage.`,
              severity: 'low',
              affected_asset: target,
              evidence: {
                header: 'X-Powered-By',
                value: poweredBy,
              },
              cwe_id: 'CWE-200',
            })
          }

          break // Successfully detected, no need to try other protocol
        } catch (error) {
          continue // Try next protocol
        }
      }
    } catch (error) {
      await this.log(context, `Service detection error: ${error}`, 'error')
    }

    await this.log(context, 'Service detection completed', 'completed')
  }
}
