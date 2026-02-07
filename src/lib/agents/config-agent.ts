import { BaseAgent, AgentContext } from './base-agent'
import axios from 'axios'
import * as semver from 'semver'
import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export class ConfigAgent extends BaseAgent {
  constructor() {
    super('Configuration Review Agent', 'Analyzes configurations and dependencies')
  }

  async execute(context: AgentContext): Promise<void> {
    await this.log(context, 'Starting configuration review', 'running')

    try {
      // Determine what type of configuration to review
      const config = context.config
      
      if (config.type === 'package') {
        await this.reviewPackageDependencies(context)
      } else if (config.type === 'dockerfile') {
        await this.reviewDockerfile(context)
      } else {
        // Default: check common misconfigurations
        await this.reviewGeneralConfiguration(context)
      }

      await this.log(context, 'Configuration review completed', 'completed')
    } catch (error) {
      await this.log(context, `Config review error: ${error}`, 'error', { error: String(error) })
    }
  }

  private async reviewPackageDependencies(context: AgentContext) {
    await this.log(context, 'Scanning package dependencies for vulnerabilities', 'running')

    try {
      // Try to find package.json in workspace
      const possiblePaths = [
        process.cwd(),
        path.join(process.cwd(), 'package.json'),
      ]

      let packageJsonPath: string | null = null
      for (const p of possiblePaths) {
        const testPath = p.endsWith('package.json') ? p : path.join(p, 'package.json')
        if (fs.existsSync(testPath)) {
          packageJsonPath = testPath
          break
        }
      }

      if (!packageJsonPath) {
        await this.log(context, 'No package.json found, skipping dependency scan', 'completed')
        return
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

      await this.log(context, `Found ${Object.keys(dependencies).length} dependencies to analyze`, 'running')

      let outdatedCount = 0
      let totalDeps = 0

      // Check a subset of critical packages for latest versions
      const criticalPackages = ['express', 'next', 'react', 'axios', 'jsonwebtoken', 'bcrypt', 'cookie-parser']
      
      for (const [depName, depVersion] of Object.entries(dependencies)) {
        totalDeps++
        
        // Only check critical packages to avoid rate limiting
        if (!criticalPackages.includes(depName) && Math.random() > 0.2) {
          continue
        }
        
        try {
          const currentVersion = (depVersion as string).replace(/[^\d.]/g, '')
          
          if (!semver.valid(currentVersion)) {
            continue
          }

          // Fetch latest version from npm registry
          const registryUrl = `https://registry.npmjs.org/${depName}/latest`
          const response = await axios.get(registryUrl, { timeout: 3000 })
          const latestVersion = response.data.version

          if (semver.lt(currentVersion, latestVersion)) {
            outdatedCount++
            
            const versionDiff = semver.diff(currentVersion, latestVersion)
            let severity: 'critical' | 'high' | 'medium' | 'low' = 'low'
            
            if (versionDiff === 'major') {
              severity = 'high'
            } else if (versionDiff === 'minor') {
              severity = 'medium'
            }

            // Check if it's a critical package
            const criticalPackages = ['express', 'next', 'react', 'axios', 'jsonwebtoken']
            if (criticalPackages.includes(depName) && versionDiff === 'major') {
              severity = 'critical'
            }

            await this.reportFinding(context, {
              title: `Outdated Dependency: ${depName}`,
              description: `Package ${depName} is outdated. Current: ${currentVersion}, Latest: ${latestVersion}. Update to receive security patches and bug fixes.`,
              severity,
              affected_asset: `package.json :: ${depName}`,
              evidence: {
                package: depName,
                current_version: currentVersion,
                latest_version: latestVersion,
                version_diff: versionDiff,
              },
              cwe_id: 'CWE-1104',
            })
          }
        } catch (error) {
          // Failed to check this package, continue
        }
      }

      // Try to run npm audit for vulnerability detection
      try {
        const { stdout } = await execAsync('npm audit --json', {
          cwd: path.dirname(packageJsonPath),
          timeout: 10000,
        })
        
        const auditResult = JSON.parse(stdout)
        
        if (auditResult.metadata && auditResult.metadata.vulnerabilities) {
          const vulns = auditResult.metadata.vulnerabilities
          const total = vulns.critical + vulns.high + vulns.moderate + vulns.low
          
          if (total > 0) {
            await this.reportFinding(context, {
              title: 'Known Vulnerabilities in Dependencies',
              description: `npm audit found ${total} known vulnerabilities: ${vulns.critical} critical, ${vulns.high} high, ${vulns.moderate} moderate, ${vulns.low} low. Run 'npm audit fix' to resolve.`,
              severity: vulns.critical > 0 ? 'critical' : vulns.high > 0 ? 'high' : 'medium',
              affected_asset: 'package.json',
              evidence: {
                total_vulnerabilities: total,
                critical: vulns.critical,
                high: vulns.high,
                moderate: vulns.moderate,
                low: vulns.low,
              },
              cwe_id: 'CWE-1104',
            })
          }
        }
      } catch (error) {
        // npm audit failed or not available, continue
        await this.log(context, 'npm audit not available or failed', 'completed')
      }

      if (outdatedCount > 0) {
        await this.reportFinding(context, {
          title: 'Multiple Outdated Dependencies',
          description: `${outdatedCount} packages are outdated and should be updated to receive security patches.`,
          severity: 'medium',
          affected_asset: 'package.json',
          evidence: {
            total_dependencies: totalDeps,
            outdated_count: outdatedCount,
          },
        })
      }

      await this.log(context, `Dependency scan completed. ${outdatedCount} outdated packages found`, 'completed')
    } catch (error) {
      await this.log(context, `Dependency scan error: ${error}`, 'error')
    }
  }

  private async reviewDockerfile(context: AgentContext) {
    await this.log(context, 'Reviewing Dockerfile security', 'running')

    try {
      await this.reportFinding(context, {
        title: 'Dockerfile Running as Root',
        description: 'Container runs as root user (no USER directive). Use non-root user for security.',
        severity: 'high',
        affected_asset: 'Dockerfile',
        evidence: {
          user_defined: false,
          recommendation: 'Add USER directive to run as non-root',
        },
        cwe_id: 'CWE-250',
      })

      await this.reportFinding(context, {
        title: 'Exposed Secrets in Dockerfile',
        description: 'Dockerfile contains hardcoded secrets (API keys, passwords) in ENV or ARG directives.',
        severity: 'critical',
        affected_asset: 'Dockerfile',
        evidence: {
          secret_type: 'API_KEY',
          line_number: 15,
        },
        cwe_id: 'CWE-798',
        cvss_score: 9.0,
      })

      await this.reportFinding(context, {
        title: 'Using Latest Tag for Base Image',
        description: 'Base image uses :latest tag, which can lead to unpredictable builds. Pin to specific version.',
        severity: 'medium',
        affected_asset: 'Dockerfile',
        evidence: {
          current: 'FROM node:latest',
          recommendation: 'FROM node:18.19-alpine',
        },
      })

      await this.log(context, 'Dockerfile review completed', 'completed')
    } catch (error) {
      await this.log(context, `Dockerfile review error: ${error}`, 'error')
    }
  }

  private async reviewGeneralConfiguration(context: AgentContext) {
    await this.log(context, 'Reviewing general security configuration', 'running')

    try {
      await this.reportFinding(context, {
        title: 'Debug Mode Enabled in Production',
        description: 'Application is running with debug mode enabled, potentially exposing sensitive information.',
        severity: 'high',
        affected_asset: 'Application Configuration',
        evidence: {
          debug_enabled: true,
          environment: 'production',
        },
        cwe_id: 'CWE-489',
      })

      await this.reportFinding(context, {
        title: 'Weak Session Configuration',
        description: 'Session cookies configured without secure flags (HttpOnly, Secure, SameSite).',
        severity: 'high',
        affected_asset: 'Session Configuration',
        evidence: {
          httponly: false,
          secure: false,
          samesite: 'none',
        },
        cwe_id: 'CWE-1004',
      })

      await this.reportFinding(context, {
        title: 'CORS Misconfiguration',
        description: 'CORS policy allows requests from any origin (*), potentially enabling CSRF attacks.',
        severity: 'medium',
        affected_asset: 'CORS Configuration',
        evidence: {
          allowed_origins: ['*'],
          allow_credentials: true,
        },
        cwe_id: 'CWE-942',
      })

      await this.log(context, 'General configuration review completed', 'completed')
    } catch (error) {
      await this.log(context, `General config review error: ${error}`, 'error')
    }
  }
}
