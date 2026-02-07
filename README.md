# 🛡️ HeimdallAI — AI-Powered Autonomous Penetration Testing Platform

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

1. **🌐 Network Penetration** - Infrastructure testing with DNS enumeration, subdomain discovery, port scanning, and service detection
2. **🌐 Web Application** - OWASP Top 10 testing with SQL injection, XSS, CSRF detection, robots.txt & sitemap analysis
3. **📱 Mobile Application** - iOS/Android security with static/dynamic analysis **[Upcoming]**
4. **☁️ Cloud Security** - AWS/Azure/GCP infrastructure audits and compliance checks
5. **🔌 IoT Testing** - Device security, protocol analysis, firmware review
6. **⚙️ Configuration Review** - Security hardening and compliance auditing
7. **🔑 API Security** - REST/GraphQL endpoint testing and authentication analysis

### 🔥 **Real-Time Monitoring**

- **Live Activity Logging**: See exactly what agents are testing in real-time
- **Progress Tracking**: Visual progress bars with phase indicators
- **Agent Visibility**: Know which AI agent is currently working
- **Target & Technique Display**: Real-time view of current test targets and methods
- **Scan Control**: Stop running scans with confirmation dialog

### 🎯 **Advanced Capabilities**

- **Subdomain Enumeration**: DNS-based subdomain discovery with common wordlists
- **Robots.txt Analysis**: Discover hidden/disallowed paths from robots.txt
- **Sitemap Parsing**: Extract all endpoints from sitemap.xml
- **Service Fingerprinting**: Identify running services and versions
- **Findings by Target**: Group security findings by scan target with severity badges
- **Comprehensive Filters**: Search, filter by severity/state, real-time results

### 🎯 **Testing Approaches**

- **Black Box**: No prior knowledge of the system
- **Grey Box**: Partial knowledge with limited access
- **White Box**: Full knowledge with source code access

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- Yarn or npm
- Supabase account (for database)
- Groq API key (for AI models)
- Google AI key (for Gemini models)

### Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local

# to login supabase
npx supabase login

# Push database migrations
npx supabase db push

# Run development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

After first login, grant yourself admin access:

```sql
-- Connect to your Supabase database and run:
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## 🏗️ Project Structure

```plaintext
heimdall-ai/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Main dashboard with stats
│   │   │   ├── new-scan/
│   │   │   │   └── page.tsx          # Scan configuration (9 types, modes)
│   │   │   ├── scans/[id]/
│   │   │   │   └── page.tsx          # Real-time scan monitoring + Stop button
│   │   │   ├── findings/
│   │   │   │   ├── page.tsx          # Findings list with filters & grouping
│   │   │   │   └── [id]/page.tsx     # XAI finding details
│   │   │   └── settings/
│   │   │       └── page.tsx          # Comprehensive user settings
│   │   └── api/
│   │       ├── scans/
│   │       │   ├── [id]/stream/      # SSE endpoint for real-time updates
│   │       │   └── [id]/stop/        # Stop scan endpoint
│   │       ├── findings/
│   │       │   └── [id]/state/       # State management endpoint
│   │       └── health/db/            # Database health check
│   ├── components/
│   │   ├── findings/
│   │   │   ├── FindingDetailClient.tsx   # XAI visualization
│   │   │   ├── FindingsFilters.tsx       # Search & filter UI
│   │   │   └── FindingsList.tsx          # Grouped findings list
│   │   ├── scans/
│   │   │   └── ScanLogging.tsx          # Real-time logging component
│   │   └── ui/                           # shadcn/ui components
│   └── lib/
│       ├── supabase/                     # Database client
│       ├── agents/                       # AI security agents
│       │   ├── network-agent.ts         # Network pentesting
│       │   ├── webapp-agent.ts          # Web app scanning
│       │   ├── api-agent.ts             # API security
│       │   └── orchestrator.ts          # Multi-agent coordination
│       └── types/                        # TypeScript definitions
└── supabase/
    └── migrations/                       # Database schema versions
        ├── 20260207000000_init.sql
        ├── 20260207000002_create_reports_bucket.sql
        └── 20260207000003_add_user_roles.sql
```

---

## 🎨 Tech Stack

### Frontend

- **Next.js 16 (App Router)** - React Server Components & Server Actions
- **React 19** - Latest React features
- **Tailwind CSS 4** - Modern utility-first styling
- **shadcn/ui** - Accessible component library
- **Radix UI** - Headless UI primitives
- **Lucide Icons** - Beautiful icon system

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database with Row Level Security (RLS)
- **Server-Sent Events (SSE)** - Real-time scan updates
- **Groq AI** - Fast LLM inference (LLaMA models)
- **Google Gemini** - Advanced AI analysis

### Security Tools

- **tcp-port-used** - Port availability checking
- **dns** - DNS resolution and enumeration
- **axios** - HTTP client for web requests

### Design System

- **Gradient Theme**: Blue-purple gradients throughout
- **Glassmorphism**: Backdrop blur effects
- **Animations**: Smooth transitions and pulse effects
- **Responsive**: Mobile-first design

---

**Built with ❤️ for security professionals by security professionals**
