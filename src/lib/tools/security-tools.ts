// Advanced security tools integration based on additional-tools.md
// These tools are organized by testing type and include safety options

export interface SecurityTool {
  name: string
  package: string
  description: string
  category: string
  isDangerous: boolean // Tools that can cause DoS or service disruption
  riskDescription?: string // Detailed risk explanation
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
  },
  {
    name: 'Packet Capture',
    package: 'node-pcap',
    description: 'Network packet capture and analysis',
    category: 'network',
    isDangerous: false,
    scanTypes: ['network'],
    features: ['Packet Sniffing', 'Protocol Analysis', 'Traffic Monitoring']
  },
  {
    name: 'Raw Socket',
    package: 'raw-socket',
    description: 'Raw socket support for packet crafting',
    category: 'network',
    isDangerous: true,
    riskDescription: 'Can be used for packet manipulation and potentially disruptive network attacks',
    scanTypes: ['network'],
    features: ['Packet Crafting', 'Custom Protocol Testing', 'Low-Level Network Access']
  },
  {
    name: 'FTP Client',
    package: 'ftp',
    description: 'FTP protocol testing',
    category: 'network',
    isDangerous: false,
    scanTypes: ['network'],
    features: ['FTP Enumeration', 'Anonymous Access', 'Version Detection']
  },
  {
    name: 'SNMP Client',
    package: 'snmp',
    description: 'SNMP protocol implementation',
    category: 'network',
    isDangerous: false,
    scanTypes: ['network'],
    features: ['SNMP Enumeration', 'Community String Testing', 'MIB Walking']
  },
  {
    name: 'LDAP Client',
    package: 'ldapjs',
    description: 'LDAP directory testing',
    category: 'network',
    isDangerous: false,
    scanTypes: ['network'],
    features: ['LDAP Injection', 'Anonymous Bind', 'Directory Enumeration']
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
    riskDescription: 'Can corrupt or delete database data if not properly controlled',
    scanTypes: ['webapp'],
    features: ['Union-based SQLi', 'Blind SQLi', 'Time-based SQLi', 'Error-based SQLi']
  },
  {
    name: 'XSS Tester',
    package: 'xss',
    description: 'XSS testing and payload generation',
    category: 'webapp',
    isDangerous: false,
    scanTypes: ['webapp'],
    features: ['Reflected XSS', 'Stored XSS', 'DOM XSS', 'Payload Generation']
  },
  {
    name: 'CSRF Tester',
    package: 'csrf',
    description: 'CSRF testing utilities',
    category: 'webapp',
    isDangerous: false,
    scanTypes: ['webapp'],
    features: ['Token Bypass', 'CSRF Detection', 'Referer Testing']
  },
  {
    name: 'SSRF Tester',
    package: 'ssrf',
    description: 'Server-Side Request Forgery testing',
    category: 'webapp',
    isDangerous: true,
    riskDescription: 'Can access internal systems and potentially expose sensitive data',
    scanTypes: ['webapp'],
    features: ['SSRF Detection', 'Internal Port Scanning', 'Cloud Metadata Access']
  },
  {
    name: 'XXE Tester',
    package: 'xxe',
    description: 'XXE (XML External Entity) vulnerability testing',
    category: 'webapp',
    isDangerous: true,
    riskDescription: 'Can read sensitive files and potentially cause DoS',
    scanTypes: ['webapp'],
    features: ['XXE Detection', 'File Reading', 'DTD Exploitation']
  },
  {
    name: 'Command Injection Tester',
    package: 'command-injection',
    description: 'Command injection testing',
    category: 'webapp',
    isDangerous: true,
    riskDescription: 'Can execute arbitrary commands on the target system',
    scanTypes: ['webapp'],
    features: ['OS Command Injection', 'Blind Command Injection', 'Out-of-Band Detection']
  },
  {
    name: 'Playwright',
    package: 'playwright',
    description: 'Cross-browser automation',
    category: 'webapp',
    isDangerous: false,
    scanTypes: ['webapp'],
    features: ['Multi-Browser Testing', 'Network Interception', 'Mobile Emulation']
  },
  {
    name: 'OAuth2 Tester',
    package: 'oauth2-test',
    description: 'OAuth 2.0 security testing',
    category: 'webapp',
    isDangerous: false,
    scanTypes: ['webapp', 'api'],
    features: ['Token Leak Detection', 'CSRF in OAuth', 'Redirect URI Validation
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
    riskDescription: 'Can cause service disruption and downtime',
    scanTypes: ['api'],
    features: ['Concurrent Requests', 'Rate Testing', 'Throughput Analysis', 'Latency Checks']
  },
  {
    name: 'Artillery',
    package: 'artillery',
    description: 'Load testing and performance testing',
    category: 'api',
    isDangerous: true,
    riskDescription: 'High load can overwhelm services and cause outages',
    scanTypes: ['api', 'webapp'],
    features: ['Scenario Testing', 'WebSocket Testing', 'Performance Metrics']
  },
  {
    name: 'Autocannon',
    package: 'autocannon',
    description: 'HTTP/1.1 benchmarking tool',
    category: 'api',
    isDangerous: true,
    riskDescription: 'Can generate significant load and cause service disruption',
    scanTypes: ['api', 'webapp'],
    features: ['High-Speed Requests', 'Pipeline Testing', 'Keep-Alive Testing']
  },
  {
    name: 'JWT Cracker',
    package: 'jwt-cracker',
    description: 'JWT token cracking',
    category: 'api',
    isDangerous: false,
    scanTypes: ['api', 'webapp'],
    features: ['Weak Secret Detection', 'Brute Force', 'Algorithm Confusion']
  },
  {
    name: 'GraphQL Security Suite',
    package: 'graphql-security',
    description: 'GraphQL security testing suite',
    category: 'api',
    isDangerous: false,
    scanTypes: ['api'],
    features: ['Injection Testing', 'Batching Attacks', 'Depth Limit Bypas']
  },
  {,
  {
    name: 'Checkov',
    package: 'checkov',
    description: 'Infrastructure as Code security scanning',
    category: 'cloud',
    isDangerous: false,
    scanTypes: ['cloud'],
    features: ['Terraform Scanning', 'CloudFormation', 'Kubernetes Manifests', 'Policy Violations']
  },
  {
    name: 'Trivy Scanner',
    package: 'trivy',
    description: 'Container vulnerability scanner',
    category: 'cloud',
    isDangerous: false,
    scanTypes: ['cloud'],
    features: ['CVE Detection', 'Misconfiguration', 'Secret Scanning', 'License Detection']
  }
    name: 'Cheerio',
    package: 'cheerio',
    description: 'jQuery-like HTML parsing for content analysis',
   ,
  {
    name: 'Kube-Hunter',
    package: 'kube-hunter',
    description: 'Kubernetes security testing',
    category: 'cloud',
    isDangerous: false,
    scanTypes: ['cloud'],
    features: ['Cluster Scanning', 'API Server Testing', 'etcd Exposure', 'Dashboard Access']
  } category: 'webapp',
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
   ,
  {
    name: 'Zigbee Utilities',
    package: 'zigbee',
    description: 'Zigbee protocol utilities',
    category: 'iot',
    isDangerous: false,
    scanTypes: ['iot'],
    features: ['Network Scanning', 'Device Enumeration', 'Key Extraction']
  },
  {
    name: 'Modbus Client',
    package: 'modbus',
    description: 'Modbus protocol testing',
    category: 'iot',
    isDangerous: false,
    scanTypes: ['iot'],
    features: ['Register Reading', 'Coil Testing', 'Function Code Fuzzing']
  },
  {
    name: 'Binwalk',
    package: 'binwalk',
    description: 'Firmware analysis tool',
 

// Password Attack Tools
export const passwordTools: SecurityTool[] = [
  {
    name: 'Bcrypt Hash Tester',
    package: 'bcrypt',
    description: 'Password hash testing and benchmarking',
    category: 'password',
    isDangerous: false,
    scanTypes: ['network', 'webapp'],
    features: ['Hash Verification', 'Timing Analysis', 'Strength Testing']
  },
  {
    name: 'Argon2 Hash Tester',
    package: 'argon2',
    description: 'Argon2 password hash testing',
    category: 'password',
    isDangerous: false,
    scanTypes: ['network', 'webapp'],
    features: ['Hash Verification', 'Memory-Hard Testing', 'Security Analysis']
  },
  {
    name: 'Kerberos Tester',
    package: 'kerberos',
    description: 'Kerberos authentication testing',
    category: 'password',
    isDangerous: false,
    scanTypes: ['network'],
    features: ['Ticket Analysis', 'AS-REP Roasting', 'Kerberoasting']
  }
]

// Unified Testing & Report Tools
export const unifiedTools: SecurityTool[] = [
  {
    name: 'Metasploit Integration',
    package: 'metasploit-js',
    description: 'Metasploit framework integration',
    category: 'unified',
    isDangerous: true,
    riskDescription: 'Can execute exploits that may compromise systems',
    scanTypes: ['network', 'webapp', 'cloud'],
    features: ['Exploit Database', 'Payload Generation', 'Post-Exploitation']
  },
  {
    name: 'Nessus API',
    package: 'nessus',
    description: 'Tenable Nessus API client',
    category: 'unified',
    isDangerous: false,
    scanTypes: ['network', 'webapp', 'cloud'],
    features: ['Vulnerability Scanning', 'Compliance Checks', 'Report Generation']
  },
  {
    name: 'OpenVAS API',
    package: 'openvas',
    description: 'OpenVAS vulnerability scanner API',
    category: 'unified',
    isDangerous: false,
    scanTypes: ['network', 'webapp', 'cloud'],
    features: ['CVE Detection', 'Network Scanning', 'Comprehensive Reports']
  }
]   category: 'iot',
    isDangerous: false,
    scanTypes: ['iot'],
    features: ['Firmware Extraction', 'File System Analysis', 'Signature Detection']
  } category: 'cloud',
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
    ...mobileTools,
    ...passwordTools,
    ...unifiedTools
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
    ...mobileTools,
    ...passwordTools,
    ...unifiedTools
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
  mobile: mobileTools,
  password: passwordTools,
  unified: unifiedTools
}
