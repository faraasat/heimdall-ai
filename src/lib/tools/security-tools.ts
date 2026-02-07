// Advanced security tools integration based on additional-tools.md
// These tools are organized by testing type and include safety options

export interface SecurityTool {
  name: string
  package: string
  description: string
  category: string
  isDangerous: boolean // Tools that can cause DoS or service disruption
  scanTypes: string[] // Which scan types can use this tool
  features: string[]
}

// Network Penetration Testing Tools
export const networkTools: SecurityTool[] = [
  {
    name: 'Nmap',
    package: 'node-nmap',
    description: 'Network discovery and security auditing',
    category: 'network',
    isDangerous: false,
    scanTypes: ['network'],
    features: ['Port Scanning', 'Service Detection', 'OS Fingerprinting', 'Vulnerability Scripts']
  },
  {
    name: 'DNS Lookup',
    package: 'dns',
    description: 'DNS enumeration and reconnaissance',
    category: 'network',
    isDangerous: false,
    scanTypes: ['network'],
    features: ['DNS Records', 'Zone Transfer', 'Subdomain Enum', 'DNSSEC Checks']
  },
  {
    name: 'WHOIS',
    package: 'whois-json',
    description: 'Domain registration information lookup',
    category: 'network',
    isDangerous: false,
    scanTypes: ['network'],
    features: ['Domain Info', 'Registrar Data', 'Name Servers', 'Expiration Date']
  },
  {
    name: 'SSH2',
    package: 'ssh2',
    description: 'SSH protocol testing and authentication checks',
    category: 'network',
    isDangerous: false,
    scanTypes: ['network'],
    features: ['Auth Testing', 'Banner Grabbing', 'Cipher Analysis', 'Key Exchange']
  },
  {
    name: 'TCP Port Scanner',
    package: 'tcp-port-used',
    description: 'Check TCP port availability',
    category: 'network',
    isDangerous: false,
    scanTypes: ['network'],
    features: ['Port Checking', 'Connection Testing', 'Service Discovery']
  }
]

// Web Application Testing Tools
export const webAppTools: SecurityTool[] = [
  {
    name: 'Puppeteer',
    package: 'puppeteer',
    description: 'Headless browser automation for web testing',
    category: 'webapp',
    isDangerous: false,
    scanTypes: ['webapp', 'api'],
    features: ['DOM Crawling', 'XSS Testing', 'CSRF Detection', 'Session Management']
  },
  {
    name: 'Axios',
    package: 'axios',
    description: 'HTTP client for API and web requests',
    category: 'webapp',
    isDangerous: false,
    scanTypes: ['webapp', 'api'],
    features: ['HTTP Requests', 'Header Injection', 'Parameter Fuzzing', 'Response Analysis']
  },
  {
    name: 'Cheerio',
    package: 'cheerio',
    description: 'jQuery-like HTML parsing for content analysis',
    category: 'webapp',
    isDangerous: false,
    scanTypes: ['webapp'],
    features: ['HTML Parsing', 'Form Discovery', 'Link Extraction', 'Hidden Fields']
  },
  {
    name: 'JWT Tool',
    package: 'jsonwebtoken',
    description: 'JWT token testing and manipulation',
    category: 'webapp',
    isDangerous: false,
    scanTypes: ['webapp', 'api'],
    features: ['Token Decode', 'Signature Verification', 'Algorithm Confusion', 'Expiration Checks']
  },
  {
    name: 'SQL Injection Tester',
    package: 'sql-injection-test',
    description: 'SQL injection vulnerability testing',
    category: 'webapp',
    isDangerous: true, // Can disrupt database
    scanTypes: ['webapp'],
    features: ['Union-based SQLi', 'Blind SQLi', 'Time-based SQLi', 'Error-based SQLi']
  }
]

// API Security Testing Tools
export const apiTools: SecurityTool[] = [
  {
    name: 'GraphQL Inspector',
    package: '@graphql-inspector/core',
    description: 'GraphQL security testing and schema analysis',
    category: 'api',
    isDangerous: false,
    scanTypes: ['api'],
    features: ['Schema Introspection', 'Query Complexity', 'Depth Limiting', 'Field Suggestions']
  },
  {
    name: 'Supertest',
    package: 'supertest',
    description: 'HTTP assertion library for API testing',
    category: 'api',
    isDangerous: false,
    scanTypes: ['api'],
    features: ['Endpoint Testing', 'Auth Checks', 'Rate Limit Testing', 'Response Validation']
  },
  {
    name: 'OpenAPI Security',
    package: 'openapi-security-test',
    description: 'OpenAPI/Swagger security testing',
    category: 'api',
    isDangerous: false,
    scanTypes: ['api'],
    features: ['Spec Validation', 'Auth Flow Testing', 'Parameter Fuzzing', 'Response Codes']
  },
  {
    name: 'Load Test',
    package: 'loadtest',
    description: 'Load testing for DoS simulation',
    category: 'api',
    isDangerous: true, // Can cause service disruption
    scanTypes: ['api'],
    features: ['Concurrent Requests', 'Rate Testing', 'Throughput Analysis', 'Latency Checks']
  }
]

// Cloud Security Testing Tools
export const cloudTools: SecurityTool[] = [
  {
    name: 'AWS SDK',
    package: '@aws-sdk/client-iam',
    description: 'Complete AWS SDK for reconnaissance',
    category: 'cloud',
    isDangerous: false,
    scanTypes: ['cloud'],
    features: ['IAM Analysis', 'S3 Security', 'EC2 Config', 'Security Groups']
  },
  {
    name: 'Azure Resources',
    package: '@azure/arm-resources',
    description: 'Azure Resource Manager testing',
    category: 'cloud',
    isDangerous: false,
    scanTypes: ['cloud'],
    features: ['Resource Discovery', 'RBAC Analysis', 'Network Security', 'Blob Security']
  },
  {
    name: 'Google Cloud',
    package: '@google-cloud/resource-manager',
    description: 'Google Cloud Platform SDK',
    category: 'cloud',
    isDangerous: false,
    scanTypes: ['cloud'],
    features: ['Project Analysis', 'IAM Policies', 'GCS Security', 'Firewall Rules']
  },
  {
    name: 'CloudSploit',
    package: 'cloudsploit-scanner',
    description: 'Multi-cloud security configuration scanner',
    category: 'cloud',
    isDangerous: false,
    scanTypes: ['cloud'],
    features: ['Config Audit', 'Compliance Checks', 'Best Practices', 'Risk Assessment']
  }
]

// Container & Kubernetes Tools
export const containerTools: SecurityTool[] = [
  {
    name: 'Dockerode',
    package: 'dockerode',
    description: 'Docker API client for container testing',
    category: 'cloud',
    isDangerous: false,
    scanTypes: ['cloud', 'config'],
    features: ['Container Scan', 'Image Analysis', 'Network Config', 'Volume Security']
  },
  {
    name: 'Kubernetes Client',
    package: '@kubernetes/client-node',
    description: 'Kubernetes API client for cluster security',
    category: 'cloud',
    isDangerous: false,
    scanTypes: ['cloud'],
    features: ['RBAC Analysis', 'Pod Security', 'Network Policies', 'Secret Management']
  }
]

// IoT Testing Tools (for future use)
export const iotTools: SecurityTool[] = [
  {
    name: 'MQTT',
    package: 'mqtt',
    description: 'MQTT protocol testing for IoT devices',
    category: 'iot',
    isDangerous: false,
    scanTypes: ['iot'],
    features: ['Protocol Analysis', 'Auth Testing', 'Topic Discovery', 'Message Interception']
  },
  {
    name: 'CoAP',
    package: 'coap',
    description: 'CoAP protocol implementation',
    category: 'iot',
    isDangerous: false,
    scanTypes: ['iot'],
    features: ['Protocol Testing', 'Resource Discovery', 'Observe Pattern', 'Block Transfer']
  },
  {
    name: 'Bluetooth LE',
    package: 'noble',
    description: 'Bluetooth Low Energy testing',
    category: 'iot',
    isDangerous: false,
    scanTypes: ['iot'],
    features: ['Device Discovery', 'Service Enumeration', 'Characteristic Read', 'Pairing Analysis']
  }
]

// Mobile Testing Tools (for future use)
export const mobileTools: SecurityTool[] = [
  {
    name: 'Appium',
    package: 'appium',
    description: 'Mobile app automation and testing',
    category: 'mobile',
    isDangerous: false,
    scanTypes: ['mobile'],
    features: ['UI Testing', 'Dynamic Analysis', 'API Interception', 'Data Storage']
  },
  {
    name: 'Frida',
    package: 'frida',
    description: 'Dynamic instrumentation toolkit',
    category: 'mobile',
    isDangerous: false,
    scanTypes: ['mobile'],
    features: ['Runtime Analysis', 'Method Hooking', 'Memory Inspection', 'SSL Pinning']
  }
]

// Get all tools for a specific scan type
export function getToolsForScanType(scanType: string, excludeDangerous: boolean = false): SecurityTool[] {
  const allTools = [
    ...networkTools,
    ...webAppTools,
    ...apiTools,
    ...cloudTools,
    ...containerTools,
    ...iotTools,
    ...mobileTools
  ]

  return allTools.filter(tool => {
    const matchesScanType = tool.scanTypes.includes(scanType)
    const matchesSafety = !excludeDangerous || !tool.isDangerous
    return matchesScanType && matchesSafety
  })
}

// Get all dangerous tools
export function getDangerousTools(): SecurityTool[] {
  return [
    ...networkTools,
    ...webAppTools,
    ...apiTools,
    ...cloudTools,
    ...containerTools,
    ...iotTools,
    ...mobileTools
  ].filter(tool => tool.isDangerous)
}

// Check if a scan configuration uses any dangerous tools
export function hasDangerousTools(scanTypes: string[]): boolean {
  return scanTypes.some(scanType => {
    const tools = getToolsForScanType(scanType, false)
    return tools.some(tool => tool.isDangerous)
  })
}

export const allSecurityTools = {
  network: networkTools,
  webapp: webAppTools,
  api: apiTools,
  cloud: cloudTools,
  container: containerTools,
  iot: iotTools,
  mobile: mobileTools
}
