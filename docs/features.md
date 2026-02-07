# 🎓 HeimdallAI - Features Documentation

## Table of Contents

1. [Explainable AI (XAI)](#explainable-ai-xai)
2. [Scan Modes](#scan-modes)
3. [Testing Types](#testing-types)
4. [Real-Time Logging](#real-time-logging)
5. [Finding Management](#finding-management)
6. [Architecture](#architecture)

---

## 🧠 Explainable AI (XAI)

### Overview

Our XAI system provides transparent insights into how vulnerabilities are identified, ensuring security professionals can trust and validate AI findings.

### Components

#### 1. Reasoning Chains

**Purpose**: Show step-by-step logic of vulnerability detection

**Example**:

```json
{
  "reasoning_chain": [
    "Detected unescaped user input in SQL query parameter 'username'",
    "Injected test payload: ' OR '1'='1' --",
    "Observed authentication bypass - gained unauthorized access",
    "Database error messages exposed internal structure",
    "Confirmed SQL Injection vulnerability"
  ]
}
```

**UI Visualization**:

- Numbered steps with purple gradient badges
- Each step is clearly articulated
- Shows progression from detection to confirmation

#### 2. Confidence Scoring

**Purpose**: Quantify certainty level of findings

**Calculation Factors**:

- Evidence strength (40%)
- Pattern matching accuracy (25%)
- Historical success rate (20%)
- Confirmation tests passed (15%)

**Score Ranges**:

- 0.90-1.00: High confidence (confirmed vulnerability)
- 0.70-0.89: Medium confidence (likely vulnerability)
- 0.50-0.69: Low confidence (requires manual verification)
- 0.00-0.49: Very low confidence (potential false positive)

**UI Visualization**:

- Gradient progress bar (purple to blue)
- Percentage display
- Color coding based on confidence level

#### 3. Alternative Hypotheses

**Purpose**: Show other possibilities considered during analysis

**Example**:

```json
{
  "alternative_hypotheses": [
    "Could be a Web Application Firewall false negative",
    "Might be an intentional honeypot for attacker detection",
    "Possible rate limiting causing inconsistent results"
  ]
}
```

**Benefits**:

- Demonstrates thorough analysis
- Helps security teams consider edge cases
- Reduces false positive acceptance

#### 4. Interactive Remediation

**Purpose**: Provide actionable fix guidance

**Components**:

- Step-by-step remediation instructions
- Code examples with syntax highlighting
- Estimated effort (hours/days)
- Priority level (critical/high/medium/low)
- Reference links (OWASP, CWE, NIST)

**Example**:

```json
{
  "remediation": {
    "steps": [
      "Replace string concatenation with parameterized queries",
      "Implement input validation using whitelist approach",
      "Add rate limiting to prevent brute force attempts",
      "Enable SQL error suppression in production"
    ],
    "code_examples": [
      "// Before (Vulnerable)\n$query = \"SELECT * FROM users WHERE username = '\" . $_POST['username'] . \"'\";\n\n// After (Secure)\n$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ?');\n$stmt->execute([$_POST['username']]);"
    ],
    "estimated_effort": "2-4 hours",
    "priority": "critical"
  }
}
```

---

## 🤖 Scan Modes

### Agentic Mode (AI-Driven)

**Characteristics**:

- **Autonomous Operation**: AI agents make testing decisions independently
- **Adaptive**: Adjusts strategy based on findings
- **Intelligent**: Learns from patterns and adapts techniques
- **Comprehensive**: Covers more ground faster

**Best For**:

- Large attack surfaces
- Time-constrained assessments
- Initial reconnaissance
- Continuous monitoring

**How It Works**:

1. **Planning Phase**: AI analyzes target and creates test plan
2. **Execution Phase**: Agents run tests in parallel
3. **Adaptation Phase**: Adjusts based on findings
4. **Reporting Phase**: Generates detailed findings with XAI

**Agent Types**:

- **ReconAgent**: Gathers information about target
- **EnumAgent**: Enumerates services and endpoints
- **ExploitAgent**: Tests for vulnerabilities
- **ValidationAgent**: Confirms findings
- **ReportAgent**: Generates comprehensive reports

### Manual Mode (User-Guided)

**Characteristics**:

- **User Control**: Security professional guides every step
- **Methodical**: Follows established testing methodologies
- **Precise**: Targets specific areas of concern
- **Educational**: Great for training and learning

**Best For**:

- Targeted assessments
- High-risk systems
- Compliance requirements
- Training scenarios

**How It Works**:

1. **Target Selection**: User selects specific targets
2. **Technique Selection**: Choose from technique library
3. **Execution**: Run selected tests with parameters
4. **Review**: Analyze results before proceeding
5. **Iteration**: Repeat with different techniques

**Control Features**:

- Pause/resume scanning
- Step-by-step execution
- Manual result validation
- Custom test parameters

---

## 🎯 Testing Types

### 1. Network Penetration Testing

**Scope**:

- External network perimeter
- Internal network segments
- Wireless networks

**Techniques**:

- Port scanning (TCP/UDP)
- Service enumeration
- Version detection
- Vulnerability scanning
- Network mapping
- Firewall rule testing
- VPN security assessment

**Targets**:

```json
{
  "targets": [
    "Routers and switches",
    "Firewalls and IDS/IPS",
    "Load balancers",
    "VPN endpoints",
    "Wireless access points",
    "Network services (DNS, DHCP, etc.)"
  ]
}
```

**Deliverables**:

- Network topology map
- Service inventory
- Vulnerability assessment report
- Firewall rule analysis
- Remediation recommendations

### 2. Web Application Testing

**Scope**:

- Public-facing web applications
- Admin panels
- API endpoints
- Authentication systems

**OWASP Top 10 Coverage**:

1. Broken Access Control
2. Cryptographic Failures
3. Injection (SQL, XSS, Command)
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Authentication Failures
8. Software and Data Integrity
9. Security Logging Failures
10. Server-Side Request Forgery

**Techniques**:

- SQL Injection (Boolean, Time-based, Union)
- Cross-Site Scripting (Reflected, Stored, DOM)
- CSRF testing
- Authentication bypass
- Session management testing
- Business logic flaws
- File upload vulnerabilities
- XML External Entity (XXE)

**Testing Approaches**:

- **Black Box**: No source code access
- **Grey Box**: Limited documentation provided
- **White Box**: Full source code review

### 3. Mobile Application Testing

**Platforms**:

- iOS (Swift, Objective-C)
- Android (Java, Kotlin)
- Hybrid (React Native, Flutter, Ionic)

**Testing Phases**:

**Phase 1: Static Analysis**

- Source code review
- Hardcoded credentials detection
- Insecure data storage patterns
- Weak cryptography usage
- Certificate pinning validation

**Phase 2: Dynamic Analysis**

- Runtime behavior monitoring
- API communication interception
- Local data storage inspection
- Memory analysis
- SSL/TLS validation

**Phase 3: Network Analysis**

- API endpoint security
- Data transmission encryption
- Certificate validation
- Man-in-the-middle testing

**Common Findings**:

- Insecure data storage
- Weak encryption algorithms
- Certificate validation issues
- Exposed API keys
- Insufficient transport layer security

### 4. Cloud Security Testing

**Cloud Providers**:

- Amazon Web Services (AWS)
- Microsoft Azure
- Google Cloud Platform (GCP)
- Multi-cloud environments

**Assessment Areas**:

**Identity & Access Management (IAM)**:

- Over-permissioned roles
- Unused access keys
- MFA compliance
- Service account security
- Federation configuration

**Storage Security**:

- S3 bucket permissions
- Blob storage access
- Object encryption
- Public exposure
- Versioning configuration

**Network Security**:

- Security group rules
- Network ACLs
- VPC configuration
- Subnet isolation
- NAT gateway security

**Compliance Frameworks**:

- HIPAA
- SOC 2
- ISO 27001
- PCI DSS
- GDPR

### 5. IoT Device Testing

**Device Categories**:

- Consumer (smart home, wearables)
- Industrial (sensors, controllers)
- Healthcare (medical devices)

**Testing Layers**:

**Device Layer**:

- Default credentials
- Firmware vulnerabilities
- Physical security
- Debug interfaces
- Update mechanisms

**Communication Layer**:

- Protocol security (MQTT, CoAP, BLE)
- Encryption implementation
- Authentication mechanisms
- Message integrity

**Application Layer**:

- API security
- Cloud backend security
- Mobile app security
- Web interface testing

**Common Vulnerabilities**:

- Weak default passwords
- Unencrypted communications
- Insecure firmware updates
- Lack of device authentication
- Privacy concerns

### 6. Configuration Review

**Systems Covered**:

- Operating systems (Linux, Windows, macOS)
- Web servers (Apache, Nginx, IIS)
- Databases (PostgreSQL, MySQL, MongoDB)
- Applications (custom and COTS)

**Review Areas**:

**Security Hardening**:

- Unnecessary services disabled
- Default accounts removed
- Strong password policies
- Encryption enabled
- Logging configured

**Compliance**:

- CIS Benchmarks
- NIST guidelines
- Vendor best practices
- Industry standards

---

## 🔥 Real-Time Logging

### Architecture

**Server-Sent Events (SSE)**:

```typescript
// Client connection
const eventSource = new EventSource(`/api/scans/${scanId}/stream`);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Process scan updates, logs, findings
};
```

### Log Entry Structure

```typescript
interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "success" | "warning" | "error";
  agent?: string; // AI agent name
  phase?: string; // Testing phase
  message: string; // Human-readable message
  target?: string; // Current target
  technique?: string; // Technique being used
  progress?: number; // Phase progress (0-100)
}
```

### Update Frequency

- **Polling Interval**: 2 seconds
- **Batch Size**: Up to 50 logs per update
- **Retention**: Last 100 logs in memory
- **Auto-scroll**: Enabled for new entries

### Visual Features

**Color Coding**:

- 🟦 Info (Blue): General information
- 🟩 Success (Green): Completed actions
- 🟨 Warning (Yellow): Potential issues
- 🟥 Error (Red): Failed operations

**Current Status Display**:

- Active phase indicator
- Progress bar (0-100%)
- Current agent badge
- Live activity pulse animation

**Log Filtering** (Future):

- By severity level
- By agent type
- By technique
- Time range selection

---

## 📋 Finding Management

### Finding States

```typescript
type FindingState =
  | "new" // Just discovered
  | "confirmed" // Verified as real
  | "false_positive" // Not a real vulnerability
  | "remediated" // Fixed by dev team
  | "accepted_risk"; // Known but accepted
```

### State Transitions

```
new → confirmed → remediated
    → false_positive
    → accepted_risk
```

### Dynamic Filtering

**Filter Categories**:

1. **Search**: Full-text search across title and description
2. **Severity**: Critical, High, Medium, Low, Info
3. **State**: New, Confirmed, False Positive, Remediated, Accepted Risk
4. **Scan Type**: Filter by testing methodology
5. **Date Range**: Discovered within timeframe

**Performance Optimization**:

- Client-side filtering with `useMemo`
- Debounced search input (300ms)
- Index-based lookups
- Lazy loading for large datasets

### Batch Operations (Future)

```typescript
// Mark multiple findings as fixed
await updateFindingsState({
  ids: [1, 2, 3, 4, 5],
  state: "remediated",
  comment: "Fixed in PR #123",
});
```

---

## 🏗️ Architecture

### Tech Stack

**Frontend**:

```
Next.js 15 (App Router)
  └─ React 19 (Server Components)
      └─ Tailwind CSS 4
          └─ shadcn/ui + Radix UI
```

**Backend**:

```
Next.js API Routes
  └─ Supabase (PostgreSQL)
      └─ Row Level Security
          └─ Real-time subscriptions
```

**Real-Time**:

```
Server-Sent Events (SSE)
  └─ EventSource API
      └─ Auto-reconnection
          └─ Backpressure handling
```

### Database Schema

```sql
-- Scans table
CREATE TABLE scans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name VARCHAR(255),
  target VARCHAR(500),
  scan_types TEXT[],
  scan_mode VARCHAR(20),
  testing_approach VARCHAR(20),
  status VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Findings table
CREATE TABLE findings (
  id UUID PRIMARY KEY,
  scan_id UUID REFERENCES scans,
  title VARCHAR(500),
  description TEXT,
  severity VARCHAR(20),
  state VARCHAR(50),
  confidence_score FLOAT,
  ai_reasoning JSONB,
  remediation JSONB,
  evidence JSONB,
  cwe_id INTEGER,
  cvss_score FLOAT,
  affected_asset VARCHAR(500),
  discovered_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Agent activity logs
CREATE TABLE agent_activity_logs (
  id UUID PRIMARY KEY,
  scan_id UUID REFERENCES scans,
  agent_name VARCHAR(100),
  agent_type VARCHAR(50),
  phase VARCHAR(100),
  message TEXT,
  level VARCHAR(20),
  target VARCHAR(500),
  technique VARCHAR(200),
  progress INTEGER,
  created_at TIMESTAMP
);
```

### API Endpoints

```
GET    /api/scans              # List all scans
POST   /api/scans              # Create new scan
GET    /api/scans/[id]         # Get scan details
GET    /api/scans/[id]/stream  # SSE endpoint for real-time updates

GET    /api/findings           # List all findings
GET    /api/findings/[id]      # Get finding details
PATCH  /api/findings/[id]/state # Update finding state

GET    /api/dashboard/stats    # Dashboard statistics
```

### Component Hierarchy

```
App
├── Layout (Navigation, Auth)
├── Dashboard
│   ├── Stats Cards
│   ├── Security Score Widget
│   └── Recent Activity Feed
├── New Scan
│   ├── Mode Selection (Agentic/Manual)
│   ├── Approach Selection (Black/Grey/White Box)
│   ├── Type Selection (9 types)
│   ├── Configuration Form
│   └── Summary Preview
├── Scan Detail
│   ├── Header (Status, Progress)
│   ├── Stats Overview
│   ├── ScanLogging Component (Real-time)
│   ├── Agent Activity Feed
│   └── Findings List
└── Finding Detail
    ├── Header (Severity, State)
    ├── XAI Analysis Card
    │   ├── Reasoning Chain
    │   ├── Confidence Score
    │   └── Alternative Hypotheses
    ├── Technical Details
    ├── Evidence Display
    ├── Remediation Guidance
    └── Quick Actions Sidebar
```

---

## 🎨 Design System

### Color Palette

```css
/* Primary Gradients */
--gradient-primary: linear-gradient(to right, #3b82f6, #8b5cf6);
--gradient-success: linear-gradient(to right, #10b981, #059669);
--gradient-warning: linear-gradient(to right, #f59e0b, #d97706);
--gradient-danger: linear-gradient(to right, #ef4444, #dc2626);

/* Severity Colors */
--critical: #ef4444; /* Red */
--high: #f97316; /* Orange */
--medium: #eab308; /* Yellow */
--low: #3b82f6; /* Blue */
--info: #6b7280; /* Gray */
```

### Animation Library

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
  }
}
```

---

## 📊 Performance Optimizations

### Client-Side

- React Server Components for initial render
- `useMemo` for expensive computations
- Lazy loading for large datasets
- Debounced search inputs
- Virtual scrolling for long lists

### Server-Side

- Supabase connection pooling
- Query optimization with indexes
- Pagination for large result sets
- Caching with stale-while-revalidate

### Real-Time

- SSE for efficient push updates
- Batch log processing
- Log retention limits (100 recent)
- Auto-reconnection with exponential backoff

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainers**: HeimdallAI Team
