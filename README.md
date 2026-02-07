# 🛡️ Deriv Aegis - AI-Powered Security Testing Platform

> **Autonomous Penetration Testing with Explainable AI**

A comprehensive security assessment platform powered by AI agents that provides intelligent vulnerability detection, real-time monitoring, and explainable security insights.

---

## ✨ Key Features

### 🤖 **Dual-Mode Operation**
- **Agentic Mode**: AI agents autonomously execute tests, adapt to findings, and make intelligent decisions
- **Manual Mode**: User-guided step-by-step testing with full control over techniques and targets

### 🧠 **Explainable AI (XAI)**
- **Reasoning Chains**: Transparent step-by-step logic showing how vulnerabilities were identified
- **Confidence Scoring**: Quantified certainty levels for each finding
- **Alternative Hypotheses**: Shows other possibilities considered during analysis
- **Interactive Remediation**: Detailed fix guidance with code examples and effort estimates

### 📊 **Comprehensive Testing Types**

1. **🌐 Network Penetration** - Infrastructure testing with port scanning and service enumeration
2. **🌐 Web Application** - OWASP Top 10 testing with SQL injection, XSS, CSRF detection
3. **📱 Mobile Application** - iOS/Android security with static/dynamic analysis
4. **☁️ Cloud Security** - AWS/Azure/GCP infrastructure audits and compliance checks
5. **🔌 IoT Testing** - Device security, protocol analysis, firmware review
6. **⚙️ Configuration Review** - Security hardening and compliance auditing

### 🔥 **Real-Time Monitoring**
- **Live Activity Logging**: See exactly what agents are testing in real-time
- **Progress Tracking**: Visual progress bars with phase indicators
- **Agent Visibility**: Know which AI agent is currently working
- **Target & Technique Display**: Real-time view of current test targets and methods

### 🎯 **Testing Approaches**
- **Black Box**: No prior knowledge of the system
- **Grey Box**: Partial knowledge with limited access
- **White Box**: Full knowledge with source code access

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Yarn or npm
- Supabase account (for database)

### Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Project Structure

```
deriv/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Main dashboard with stats
│   │   │   ├── new-scan/
│   │   │   │   └── page.tsx          # Scan configuration (9 types, modes)
│   │   │   ├── scans/[id]/
│   │   │   │   └── page.tsx          # Real-time scan monitoring
│   │   │   └── findings/
│   │   │       ├── page.tsx          # Findings list with filters
│   │   │       └── [id]/page.tsx     # XAI finding details
│   │   └── api/
│   │       ├── scans/
│   │       │   └── [id]/stream/      # SSE endpoint for real-time updates
│   │       └── findings/
│   │           └── [id]/state/       # State management endpoint
│   ├── components/
│   │   ├── findings/
│   │   │   ├── FindingDetailClient.tsx   # XAI visualization
│   │   │   ├── FindingsFilters.tsx       # Search & filter UI
│   │   │   └── FindingsList.tsx          # Dynamic findings list
│   │   ├── scans/
│   │   │   └── ScanLogging.tsx          # Real-time logging component
│   │   └── ui/                           # shadcn/ui components
│   └── lib/
│       ├── supabase/                     # Database client
│       └── types/                        # TypeScript definitions
└── docs/
    ├── concept.md                        # Full platform concept
    ├── mvp.md                            # MVP specifications
    └── technologies.md                   # Tech stack details
```

---

## 🎨 Tech Stack

### Frontend
- **Next.js 15** - App Router with React Server Components
- **React 19** - Latest React features
- **Tailwind CSS 4** - Modern utility-first styling
- **shadcn/ui** - Accessible component library
- **Radix UI** - Headless UI primitives

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database with auth
- **Server-Sent Events (SSE)** - Real-time updates

### Design System
- **Gradient Theme**: Blue-purple gradients throughout
- **Glassmorphism**: Backdrop blur effects
- **Animations**: Smooth transitions and pulse effects
- **Responsive**: Mobile-first design

---

## 🧪 Core Workflows

### 1. Creating a New Scan

```typescript
// User selects:
1. Scan Mode (Agentic/Manual)
2. Testing Approach (Black/Grey/White Box)
3. Testing Types (Network, Web App, Mobile, etc.)
4. Target URL/IP
5. Optional natural language instructions

// System creates scan with metadata
POST /api/scans
{
  name: "Production Security Audit",
  target: "https://example.com",
  scan_mode: "agentic",
  testing_approach: "blackbox",
  scan_types: ["webapp", "api", "network"]
}
```

### 2. Real-Time Monitoring

```typescript
// SSE connection established
const eventSource = new EventSource(`/api/scans/${scanId}/stream`)

// Receives updates every 2 seconds:
{
  scan: { status: "running", progress: 45 },
  logs: [
    {
      agent_name: "WebAppScanner",
      phase: "authentication_testing",
      message: "Testing login endpoint for SQL injection",
      target: "/api/login",
      technique: "SQL Injection"
    }
  ],
  findings: [...new findings]
}
```

### 3. XAI Finding Analysis

```typescript
// Finding with explainable AI data
{
  title: "SQL Injection in Login Form",
  severity: "critical",
  ai_reasoning: {
    reasoning_chain: [
      "Detected unescaped user input in SQL query",
      "Successfully injected payload: ' OR '1'='1",
      "Authentication bypass confirmed",
      "Database error messages exposed"
    ],
    confidence_score: 0.95,
    alternative_hypotheses: [
      "Could be WAF false negative",
      "Might be intentional honeypot"
    ]
  },
  remediation: {
    steps: [
      "Use parameterized queries",
      "Implement input validation",
      "Add rate limiting"
    ],
    code_examples: ["$stmt = $pdo->prepare('SELECT...')"],
    estimated_effort: "2-4 hours",
    priority: "critical"
  }
}
```

---

## 🔒 Security & Compliance

- **Authorized Testing Only**: Built-in safeguards for authorized scans
- **Rate Limiting**: Prevents aggressive scanning
- **Audit Logging**: Complete activity trail
- **Role-Based Access**: User authentication and authorization
- **Data Encryption**: At rest and in transit

---

## 🎯 Testing Methodologies

### Network Penetration
- Port Scanning & Service Detection
- Vulnerability Assessment
- Network Mapping
- Firewall Testing

### Web Application
- OWASP Top 10 Testing
- Authentication & Authorization
- Input Validation
- Business Logic Flaws

### Mobile Application
- Static Code Analysis
- Dynamic Runtime Testing
- API Security Testing
- Local Data Storage Review

### Cloud Security
- IAM Policy Review
- Storage Security Audit
- Network Configuration
- Compliance Checks (HIPAA, SOC2, etc.)

### IoT Testing
- Device Authentication
- Communication Protocol Security
- Firmware Analysis
- Hardware Interface Testing

### Configuration Review
- Security Hardening Assessment
- Best Practice Compliance
- Baseline Configuration Review
- Policy Audit

---

## 📈 Roadmap

### Phase 1: Core Platform ✅
- [x] 9 testing types
- [x] Agentic & manual modes
- [x] Real-time logging
- [x] XAI explanations
- [x] Dynamic filtering

### Phase 2: Advanced Features (In Progress)
- [ ] Integration with security tools (Nmap, Burp Suite, etc.)
- [ ] Custom test templates
- [ ] Team collaboration features
- [ ] Compliance report generation
- [ ] API integrations (Slack, Jira)

### Phase 3: Enterprise Features
- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard
- [ ] Custom agent creation
- [ ] Workflow automation
- [ ] SLA management

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🆘 Support

For questions or support:
- 📧 Email: support@deriv-aegis.com
- 💬 Discord: [Join our community](https://discord.gg/deriv-aegis)
- 📚 Docs: [docs.deriv-aegis.com](https://docs.deriv-aegis.com)

---

## 🌟 Features Showcase

### Dashboard
- Real-time security score calculation
- Activity feed with live updates
- Statistics cards with severity breakdown
- Quick access to recent scans and findings

### Scan Configuration
- Multi-select testing types
- Intuitive mode selection
- Natural language instructions support
- Comprehensive summary before launch

### Finding Details
- Color-coded severity indicators
- Reasoning chain visualization
- Confidence score progress bars
- Interactive remediation steps
- External reference links (CWE, OWASP, NIST)

### Real-Time Logging
- Phase-based progress tracking
- Agent activity indicators
- Target and technique display
- Auto-scrolling log stream
- Severity-based color coding

---

**Built with ❤️ for security professionals by security professionals**
