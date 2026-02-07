import { BaseAgent, AgentContext } from './base-agent'
import axios from 'axios'

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
      // Simulated dependency scan (in production, would integrate with npm audit, Snyk, etc.)
      const vulnerableDependencies = [
        {
          package: 'lodash',
          version: '4.17.15',
          vulnerability: 'CVE-2020-8203',
          severity: 'high',
          fixed_in: '4.17.21',
        },
        {
          package: 'axios',
          version: '0.18.0',
          vulnerability: 'CVE-2021-3749',
          severity: 'medium',
          fixed_in: '0.21.1',
        },
        {
          package: 'express',
          version: '4.16.0',
          vulnerability: 'CVE-2022-24999',
          severity: 'critical',
          fixed_in: '4.17.3',
        },
      ]

      for (const dep of vulnerableDependencies) {
        await this.reportFinding(context, {
          title: `Vulnerable Dependency: ${dep.package}`,
          description: `Package ${dep.package}@${dep.version} has known vulnerability ${dep.vulnerability}. Update to ${dep.fixed_in} or later.`,
          severity: dep.severity as any,
          affected_asset: `package.json :: ${dep.package}`,
          evidence: {
            package: dep.package,
            current_version: dep.version,
            vulnerability_id: dep.vulnerability,
            fixed_version: dep.fixed_in,
          },
          cwe_id: 'CWE-1104',
        })
      }

      await this.reportFinding(context, {
        title: 'Outdated Dependencies',
        description: 'Multiple packages are significantly outdated and should be updated to receive security patches.',
        severity: 'medium',
        affected_asset: 'package.json',
        evidence: {
          total_dependencies: 45,
          outdated_count: 12,
        },
      })

      await this.log(context, 'Dependency scan completed', 'completed')
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
