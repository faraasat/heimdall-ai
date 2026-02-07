# HeimdallAI — Minimum Viable Product (MVP) Specification

## Executive Summary

The HeimdallAI MVP delivers an AI-powered autonomous penetration testing platform focused on six critical security testing domains. This MVP scope is designed to be buildable within the hackathon timeline while demonstrating the core value proposition: intelligent, continuous, and accessible security testing powered by agentic AI.

The MVP will showcase a fully functional end-to-end workflow where users can define targets using natural language, watch AI agents autonomously execute comprehensive security assessments, and receive actionable, explainable findings—all through an intuitive web interface.

---

## MVP Scope & Boundaries

### Core Testing Capabilities (In Scope)

The MVP includes six specialized testing modules, each with a dedicated AI agent:

1. **Network Penetration Testing**
2. **Web Application Penetration Testing**
3. **API Penetration Testing**
4. **Cloud Penetration Testing**
5. **IoT Penetration Testing**
6. **Build Review / Configuration Review**

### Limited Testing Capabilities (Minimal Implementation)

These testing types will have basic placeholder implementations to demonstrate architectural extensibility:

- **Mobile Application Testing**: Basic static analysis only
- **OT/ICS Testing**: Not included in MVP (requires specialized hardware and protocols)
- **Red Team Exercises**: Not included in MVP (requires prolonged engagement and social engineering)

### Explicitly Out of Scope for MVP

- Advanced exploit development and custom payload generation
- Physical security testing integration
- Social engineering campaigns
- Integration with corporate ticketing systems (Jira, ServiceNow)
- Multi-user team collaboration features
- Advanced role-based access control (beyond basic user/admin)
- Mobile companion applications
- Compliance certification workflows (SOC 2, ISO 27001 deep integration)
- Advanced machine learning model training on scan data

---

## Target Users & User Journeys

### Primary User Personas

#### 1. Security Engineer (Sarah)

**Profile**: Mid-level security professional at a mid-sized SaaS company. Responsible for security testing but has limited time and budget.

**Pain Points**:

- Annual pentests leave 11 months of blind spots
- Manual testing tools require expert configuration
- Cannot afford full-time pentesters or expensive consultants
- Struggles to justify security spending to management without clear ROI

**What Sarah Needs from MVP**:

- Quick scan setup with minimal configuration
- Clear, prioritized findings with evidence
- Ability to re-run tests continuously
- Reports she can share with her CISO

**MVP User Journey**:

1. Signs up with Google OAuth
2. Adds first target (company web application URL)
3. Selects "Web Application Penetration Test"
4. Watches real-time agent activity as the scan runs
5. Receives findings prioritized by real-world exploitability
6. Downloads professional PDF report for her CISO
7. Sets up weekly recurring scans

#### 2. DevOps Lead (Marcus)

**Profile**: Technical lead responsible for cloud infrastructure security at a fintech startup. Has AWS/Azure experience but isn't a security specialist.

**Pain Points**:

- Deploys infrastructure changes frequently
- Unsure if new deployments introduce vulnerabilities
- Cloud security tools generate too many false positives
- Needs to prove security posture to customers and auditors

**What Marcus Needs from MVP**:

- Cloud configuration review integrated with his workflow
- Clear distinction between critical issues and noise
- Remediation guidance he can actually execute
- Continuous monitoring of infrastructure changes

**MVP User Journey**:

1. Connects AWS account via IAM role (read-only)
2. Initiates cloud security assessment
3. Reviews findings organized by service (EC2, S3, IAM, etc.)
4. Gets step-by-step remediation instructions
5. Re-runs scan to verify fixes
6. Exports compliance report for audit

#### 3. Startup Founder (Alex)

**Profile**: Technical co-founder of an early-stage startup. Limited budget, wearing many hats, needs security testing before customer audits.

**Pain Points**:

- Cannot afford $20K+ pentest engagements
- Lacks in-house security expertise
- Customers asking for security documentation before deals
- Needs to demonstrate security maturity to investors

**What Alex Needs from MVP**:

- Affordable, self-service security testing
- Plain-language findings without security jargon
- Quick turnaround (hours, not weeks)
- Professional-looking reports to share with customers

**MVP User Journey**:

1. Signs up with email
2. Uses natural language: "Test my website for critical vulnerabilities"
3. Gets scan results within 15 minutes
4. Reviews top 5 critical findings explained in simple terms
5. Follows fix-it guides for each finding
6. Generates customer-ready security assessment report
7. Shares report with prospective customer during security review

---

## Functional Requirements

### 1. User Authentication & Access Control

#### Authentication

- Email/password registration with email verification
- Google OAuth 2.0 integration
- JWT-based session management with automatic token refresh
- "Forgot password" flow with secure reset tokens
- Multi-factor authentication (MFA) for production (not MVP)

#### Authorization

- Two user roles: Standard User and Admin
- Standard User can: create scans, view own scans, generate reports, manage profile
- Admin can: view all scans, manage users, view system health metrics
- Row-level security enforced at database level

#### Account Management

- User profile with email, name, organization
- Basic preferences: timezone, notification settings
- API key generation for programmatic access (post-MVP)
- Usage limits per user (scan quotas, storage limits)

---

### 2. Target Definition & Scan Configuration

#### Natural Language Target Input

Users can define targets using plain language:

- "Scan my web application at https://example.com"
- "Check the API at api.example.com for authentication issues"
- "Review my AWS account configuration"
- "Test the network at 192.168.1.0/24"

The system parses intent, extracts targets, and confirms detected parameters before proceeding.

#### Structured Target Configuration

For users who prefer explicit control, provide form-based input:

**Network Pentesting**:

- Target IP range or CIDR notation
- Optional exclusions (IPs to skip)
- Scan intensity (light, normal, aggressive)
- Port range (common ports, all ports, custom range)

**Web Application Pentesting**:

- Target URL(s)
- Authentication credentials (optional for authenticated scanning)
- Spider depth limit
- Rate limiting configuration
- Exclusion patterns (URLs to avoid)

**API Pentesting**:

- Base API URL
- OpenAPI/Swagger specification URL (optional)
- Authentication method (API key, Bearer token, OAuth)
- GraphQL endpoint detection

**Cloud Pentesting**:

- Cloud provider (AWS, Azure, GCP)
- Access credentials or IAM role ARN
- Specific services to assess (or scan all)
- Region selection

**IoT Pentesting**:

- Device IP address
- Device type (camera, sensor, gateway, generic)
- Communication protocols in use (HTTP, MQTT, CoAP)
- Firmware upload (optional)

**Build/Config Review**:

- File upload (package.json, requirements.txt, Dockerfile, Terraform files)
- Cloud resource ARN or management URL
- Operating system type for baseline comparison

#### Scan Scheduling

- On-demand (immediate execution)
- Scheduled recurring scans (daily, weekly, monthly)
- Continuous monitoring mode (automatic re-scan when changes detected)

#### Scope Validation & Safety Controls

Before scan execution:

- Verify target ownership (DNS TXT record verification or file upload to webroot)
- Display scope summary for user confirmation
- Legal terms acceptance for each scan
- Automatic detection and blocking of public infrastructure targets
- Rate limiting to prevent accidental DoS

---

### 3. AI Agent Orchestration & Execution

#### Agent Architecture

**Orchestrator Agent**:
The master coordinator that:

- Interprets user intent and scan configuration
- Determines which specialized agents to deploy
- Manages agent execution sequence and parallelization
- Handles inter-agent communication and data sharing
- Monitors overall scan progress and health
- Enforces safety guardrails and scope boundaries

**Reconnaissance Agent**:

- DNS enumeration (A, AAAA, MX, NS, TXT, CNAME records)
- Subdomain discovery via wordlists and brute-forcing
- WHOIS lookups for domain registration information
- Technology fingerprinting (web servers, frameworks, CMS detection)
- SSL/TLS certificate analysis
- Network topology mapping (traceroute, AS lookups)
- OSINT collection from publicly available sources

**Scanner Agent**:

- Port scanning (TCP SYN, ACK, UDP scans)
- Service version detection
- Operating system fingerprinting
- Vulnerability signature matching against CVE database
- Configuration weakness detection
- Security header analysis (CSP, HSTS, X-Frame-Options, etc.)
- Certificate validation (expiry, chain of trust, weak ciphers)

**Exploit Analysis Agent**:

- Evaluates discovered vulnerabilities for exploitability
- Reasons about attack chains and privilege escalation paths
- Assesses real-world impact based on target context
- Performs safe exploitation validation (proof without harm)
- Determines false positive likelihood using LLM reasoning
- Generates proof-of-concept payloads for validation

**Web Application Agent**:

- HTTP spidering and crawling
- Form detection and parameter extraction
- Input validation testing (SQLi, XSS, command injection)
- Authentication mechanism analysis
- Session management testing
- CSRF token validation
- File upload restriction testing
- Business logic flaw detection

**API Security Agent**:

- API endpoint discovery and mapping
- OpenAPI/Swagger specification parsing
- GraphQL introspection and schema analysis
- Authentication flow testing (OAuth, JWT, API keys)
- Authorization boundary testing (BOLA, BFLA)
- Parameter fuzzing and type confusion
- Rate limiting bypass attempts
- Mass assignment vulnerability detection

**Cloud Security Agent**:

- IAM policy analysis for excessive permissions
- Storage bucket enumeration and access testing (S3, Blob Storage)
- Security group and network ACL review
- Instance metadata service exploitation attempts
- Serverless function configuration review
- Secrets management audit (hardcoded credentials)
- Logging and monitoring configuration assessment
- Compliance baseline comparison (CIS benchmarks)

**IoT Security Agent**:

- Device discovery via network scanning and SSDP
- Firmware extraction and binary analysis
- Default credential testing
- Weak encryption detection
- Insecure protocol identification (unencrypted MQTT, Telnet)
- Web interface vulnerability assessment
- Update mechanism security review

**Configuration Review Agent**:

- Package dependency vulnerability scanning (yarn, pip, Maven)
- Dockerfile and container image best practice review
- Infrastructure-as-Code security analysis (Terraform, CloudFormation)
- OS baseline hardening compliance (CIS benchmarks)
- Firewall rule effectiveness assessment
- Secret exposure detection in configuration files

#### Agent Communication & Data Flow

- Agents publish findings to a shared message bus
- Later agents consume findings from earlier agents
- Exploit Analysis Agent correlates findings from Scanner and Recon agents
- Report Agent waits for all agents to complete before synthesis
- Real-time status updates streamed to frontend via Server-Sent Events

#### AI Models & LLM Integration

**Primary LLM**: OpenAI GPT-4o (Use something free like Groq)

- Used for: Complex reasoning, attack chain analysis, false positive filtering, report generation
- Fallback: Google Gemini Pro (if OpenAI quota exceeded)

**Fast LLM**: Google Gemini Flash

- Used for: Simple classification, quick summaries, real-time chat responses
- Fallback: Groq Cloud (Llama models)

**Embedding Model**: OpenAI text-embedding-3-small

- Used for: Semantic search over findings, clustering similar vulnerabilities

**Prompt Engineering Strategy**:

- Few-shot learning examples for vulnerability classification
- Chain-of-thought prompting for exploitability reasoning
- Self-consistency checks to reduce hallucinations
- Structured output with JSON schema enforcement
- Temperature tuning: low (0.2) for classification, higher (0.7) for creative attack hypothesis

#### Safety & Ethical Controls

- Human-in-the-loop approval required before any exploit execution
- Read-only operations preferred; write operations explicitly flagged
- Automatic scan termination if target becomes unresponsive (potential DoS)
- Scope enforcement: agents cannot test IPs outside defined range
- Full audit trail of all actions taken by each agent

---

### 4. Real-Time Monitoring & Visibility

#### Live Scan Dashboard

A dedicated view showing active scan progress:

**Overall Progress Bar**:

- Percentage complete across all agents
- Estimated time remaining (dynamic based on target response times)
- Current scan phase (Reconnaissance → Scanning → Analysis → Reporting)

**Agent Activity Feed**:
Real-time stream of agent actions, displayed as:

- Timestamp
- Agent name (e.g., "Reconnaissance Agent")
- Action description (e.g., "Discovered 3 subdomains")
- Status indicator (running, waiting, completed, error)

**Live Findings Counter**:

- Total findings discovered (updates in real-time)
- Breakdown by severity (Critical, High, Medium, Low, Info)
- New findings highlighted as they're discovered

**Target Information Card**:

- Target URL, IP, or identifier
- Detected technologies (web server, frameworks, cloud provider)
- Scan start time and duration
- Scan configuration summary (testing type, scope)

#### Server-Sent Events (SSE) Implementation

Frontend subscribes to `/api/scans/[scanId]/stream` endpoint for:

- Agent status updates
- New finding events
- Progress percentage increments
- Error notifications
- Scan completion event

#### Mobile-Responsive Design

Live dashboard works on tablet and mobile devices for monitoring on-the-go.

---

### 5. Findings Management & Analysis

#### Finding Data Model

Each finding includes:

**Core Attributes**:

- Unique finding ID (UUID)
- Severity (Critical, High, Medium, Low, Informational)
- Title (concise, actionable)
- Description (detailed explanation)
- CVSS score (if applicable) and CWE ID
- Affected asset (URL, IP, API endpoint, cloud resource ARN)
- Discovery timestamp

**Evidence & Proof**:

- HTTP request/response pairs (for web/API findings)
- Command output or logs (for network/cloud findings)
- Screenshots (optional, for visual validation)
- Payload used to discover vulnerability

**AI Reasoning Chain**:

- Step-by-step explanation of how the AI identified the issue
- Confidence score (0-100%) with justification
- Alternative hypotheses considered and why they were rejected
- References to similar known vulnerabilities or CVEs

**Remediation Guidance**:

- Recommended fix (specific, actionable steps)
- Code examples or configuration changes
- Priority level (immediate, high, medium, low)
- Estimated effort to remediate (hours or complexity rating)
- Verification steps to confirm fix

**Business Impact Assessment**:

- Potential consequences if exploited
- Affected functionality or data
- Likelihood of exploitation (AI-assessed)
- Risk score (combines severity, exploitability, and business context)

#### Finding States

- **New**: Just discovered, not yet reviewed
- **Confirmed**: Validated by user or AI with high confidence
- **False Positive**: Dismissed by user or AI
- **Remediated**: Marked as fixed by user
- **Accepted Risk**: User acknowledges but chooses not to fix

#### Filtering & Search

Users can filter findings by:

- Severity level
- Finding state
- Asset/target
- Scan date range
- Discovery agent
- CVSS score range
- Search query (full-text across title, description, evidence)

#### Bulk Actions

- Mark multiple findings as remediated
- Export selected findings
- Change severity or state in bulk
- Add comments/notes to findings

#### Finding Detail View

Clicking a finding opens a detailed side-panel or modal with:

- Full evidence display (expandable sections)
- AI reasoning chain (collapsible tree view)
- User comments section
- Related findings (clustered by similarity)
- Remediation checklist with progress tracking
- Export finding as PDF snippet

---

### 6. Natural Language Chat Interface

#### Chat Features

**Conversational Scan Initiation**:
Users can type requests like:

- "Test example.com for SQL injection"
- "Scan my API for authentication issues"
- "Check if my S3 buckets are public"
- "Review my Docker configuration"

The AI parses intent, extracts parameters, asks clarifying questions if needed, then initiates the scan.

**Query Existing Scans**:

- "What were the critical findings from last week's scan?"
- "Show me all SQL injection vulnerabilities"
- "Has the XSS issue on /login been fixed?"
- "Compare this scan to the previous one"

**Remediation Assistance**:

- "How do I fix the SQL injection on line 45?"
- "What's the best way to configure CSP headers?"
- "Walk me through patching the Apache vulnerability"

**Report Generation**:

- "Generate an executive report for the last 30 days"
- "Create a detailed technical report for today's scan"
- "Export findings for compliance audit"

**Learning & Explanation**:

- "What is a BOLA vulnerability?"
- "Why is this finding marked as critical?"
- "Explain the attack chain for CVE-2024-1234"

#### Chat Implementation Details

**Context Retention**:

- Chat maintains conversation history within a session
- AI has access to: user's scans, findings, target configuration, remediation status
- Context window management (summarize old messages to fit token limits)

**Streaming Responses**:

- Token-by-token streaming for natural, responsive feel
- Typing indicators while AI is "thinking"

**Suggested Prompts**:

- Display suggested questions based on current context
- Example: After scan completes, suggest "Show me the top 5 critical issues"

**Multimodal Support (Post-MVP)**:

- Upload screenshots of errors or configuration screens
- AI analyzes images and provides guidance

---

### 7. Reporting & Export

#### Report Types

**Executive Summary Report**:
Target Audience: CISOs, management, non-technical stakeholders

Contents:

- High-level risk assessment (overall security posture)
- Key metrics: total findings, critical/high severity count, risk score
- Top 5 critical vulnerabilities in plain language
- Trend analysis (comparison to previous scans)
- Recommended next steps
- Visual risk heatmap

Format: PDF (4-6 pages), visual-first with minimal technical jargon

**Technical Detailed Report**:
Target Audience: Security engineers, developers

Contents:

- Executive summary (1 page)
- Scope definition and methodology
- Detailed findings catalog (all severities)
- Full evidence for each finding (requests, responses, logs)
- Step-by-step remediation guidance
- Appendix: Tool output, AI reasoning chains
- Glossary of terms

Format: PDF (20-50 pages), comprehensive technical depth

**Compliance Report**:
Target Audience: Auditors, compliance officers

Contents:

- Compliance framework mapping (OWASP Top 10, CIS benchmarks)
- Pass/fail status for each control
- Evidence of testing performed
- Remediation timeline
- Sign-off section for management approval

Format: PDF, organized by compliance requirement

**Findings Export (CSV/JSON)**:

- Machine-readable format for import into other tools
- All finding attributes included
- Suitable for ticketing system integration (future)

#### Report Customization

- Add company logo to reports
- Custom cover page with company name
- Adjustable severity thresholds (e.g., treat Medium as High)
- Selective finding inclusion/exclusion

#### Report Generation Workflow

1. User clicks "Generate Report" on scan detail page
2. Selects report type and customization options
3. Report Agent synthesizes findings with LLM-generated summaries
4. PDF rendered using React-PDF library
5. Report stored in Supabase Storage
6. Download link provided + email notification (optional)
7. Report accessible from scan history

#### Report Scheduling (Post-MVP)

- Automatic weekly/monthly reports emailed to stakeholders
- Digest reports summarizing all scan activity

---

### 8. User Dashboard & History

#### Dashboard Overview

**Metrics at a Glance**:

- Total scans executed (all time)
- Current active scans
- Total findings discovered
- Severity breakdown (pie chart or bar chart)
- Last scan date
- Upcoming scheduled scans

**Recent Scans**:
Table showing last 10 scans with:

- Target name/URL
- Scan type
- Status (completed, running, failed)
- Findings count
- Scan date
- Quick actions (view details, download report, re-run)

**Trend Charts**:

- Findings over time (line chart showing monthly trend)
- Top vulnerable assets (bar chart)
- Mean time to remediate (MTTR) metric
- Remediation rate (% of findings fixed)

**Quick Actions Panel**:

- "Start New Scan" button (opens scan configuration)
- "View All Findings" link
- "Recent Reports" list
- "Chat with AI" shortcut

#### Scan History

**Comprehensive Scan List**:
Paginated table of all scans ever run, with:

- Search and filter capabilities
- Sort by date, status, findings count, severity
- Bulk actions (delete old scans, compare scans)
- Data retention policy (auto-archive scans older than 1 year)

**Scan Detail Page**:
Clicking a scan opens detailed view with:

- Summary card (target, timing, configuration)
- Findings table (filterable and searchable)
- Agent activity log
- Timeline visualization (Gantt chart of agent execution)
- Compare button (to compare against another scan)
- Re-run button (to execute scan again with same config)
- Clone button (to create new scan with modified config)

#### Asset Inventory (Post-MVP)

- Automatic cataloging of all tested assets
- Asset-centric view (all scans and findings for a given asset)
- Asset tagging and grouping

---

### 9. Admin Panel

Admin users have access to additional system views:

**User Management**:

- List all users with registration date, scan count, quota usage
- Suspend or delete user accounts
- Adjust user quotas (max scans per month, storage limits)
- View user activity logs

**System Health**:

- Active scan queue length
- Agent execution times (performance metrics)
- LLM API usage and cost tracking
- Error rates and failure logs
- Database and storage usage

**Audit Logs**:

- All user actions (scan creation, finding updates, report generation)
- System events (agent failures, API errors)
- Exportable for compliance

---

## Technical Requirements

### Performance Targets

**Scan Execution Time**:

- Network scan (Class C subnet): 5-10 minutes
- Web application scan (medium-sized site): 10-15 minutes
- API scan (50 endpoints): 5-8 minutes
- Cloud configuration review: 3-5 minutes
- IoT device scan: 5-10 minutes
- Build/config review: 2-5 minutes

**Frontend Performance**:

- Time to Interactive (TTI): < 2 seconds on broadband
- Largest Contentful Paint (LCP): < 1.5 seconds
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

**API Response Times**:

- Dashboard data load: < 500ms (P95)
- Scan initiation: < 1 second
- Findings retrieval: < 800ms (P95)
- Report generation: < 30 seconds

**Scalability**:

- Support for 100 concurrent scans (MVP target)
- 1,000 registered users
- 100,000 findings stored
- 10,000 scans per month

### Data Retention & Storage

**Scan Data**:

- Scan metadata: Retain indefinitely
- Detailed evidence: Retain for 90 days by default (user-configurable)
- Archived scans: Compressed and moved to cold storage after 90 days

**Findings**:

- Active findings: No expiration
- Remediated findings: Archived after 180 days
- Full-text search index maintained for all findings

**Reports**:

- Generated reports: Stored for 1 year
- On-demand regeneration from historical scan data (if evidence still available)

**User Data**:

- Account data: Retained until account deletion
- Activity logs: 1 year retention
- Anonymous usage analytics: 2 years

### Security & Privacy

**Data Security**:

- All data encrypted at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Database connection encryption enforced
- Secrets stored in environment variables or vaults (never in code)

**Access Control**:

- Row-level security (RLS) enforced at database level
- JWT tokens with 1-hour expiration, automatic refresh
- API rate limiting by user (100 requests/minute)
- IP-based rate limiting for auth endpoints

**Privacy**:

- No sharing of user data with third parties
- LLM API providers: Data not used for model training (OpenAI zero-retention mode)
- GDPR compliance: Data export and account deletion functionality
- Minimal logging (no sensitive data in logs)

**Compliance Readiness**:

- Audit trail for all findings and remediation actions
- Exportable logs for compliance reviews
- Terms of service requiring authorized testing only
- Disclaimer: Users responsible for target authorization

---

## User Interface Specifications

### Design Principles

**Security-First Aesthetic**:

- Dark mode as default (reduces eye strain, feels professional)
- Monospace fonts for technical content (code, IPs, URLs)
- High-contrast color scheme for readability
- Severity colors: Critical (red), High (orange), Medium (yellow), Low (blue), Info (gray)

**Information Density**:

- dense but not cluttered
- Progressive disclosure: show summaries, expand for details
- Data tables with fixed headers and horizontal scroll for overflow
- Collapsible sections to manage long content

**Clarity & Scannability**:

- Clear visual hierarchy with distinct headings
- Icons to convey status at a glance
- Color-coded badges for severity, status, agent type
- Tooltips for technical terms and abbreviations

**Responsiveness**:

- Mobile-first design for monitoring on-the-go
- Desktop-optimized layouts for deep analysis work
- Consistent experience across devices

### Key Screens

#### Home/Landing Page

- Hero section: "AI-Powered Penetration Testing That Never Sleeps"
- Feature highlights (6 testing types, continuous monitoring, AI agents)
- Demo video or animated preview
- Call-to-action: "Start Your First Free Scan"
- Trust indicators: Ethical testing disclaimer, security certifications

#### Dashboard (Post-Login)

- Top navigation bar: Logo, scan button, notifications, user menu
- Left sidebar: Dashboard, Scans, Findings, Reports, Chat, Settings
- Main content area: Metrics, recent scans chart, quick actions
- Right sidebar (optional): Activity feed, upcoming scans, tips

#### Scan Configuration Page

- Breadcrumb navigation
- Scan type selector (6 cards with icons, one per testing type)
- Target input (natural language textarea OR structured form toggle)
- Advanced options (collapsible)
- Scope validation section (verify ownership)
- Action buttons: "Cancel" and "Start Scan" (primary button)

#### Live Scan View

- Full-width progress bar at top
- Three-column layout:
  - Left: Target info card, current agent status
  - Center: Agent activity feed (scrollable, auto-scrolls to new items)
  - Right: Live findings list (updates in real-time)
- Pause/Stop scan button (with confirmation modal)

#### Scan Detail Page

- Header: Target, date, status badge, actions (Download Report, Re-run, Compare, Chat About This Scan)
- Tabs: Summary, Findings, Activity Log, Configuration
- Summary tab: Key metrics, severity distribution chart, timeline
- Findings tab: Filterable/sortable table, click to expand detail
- Activity log tab: Chronological list of all agent actions

#### Finding Detail Panel

- Slide-over panel from right (doesn't obscure findings list)
- Sections: Title, severity badge, description, evidence (collapsible), AI reasoning (collapsible), remediation steps, user actions (mark as fixed, false positive, comment)
- Close button and "Next Finding" navigation

#### Chat Interface

- Slide-over panel from right (can be pinned to stay open)
- Message history (user messages aligned right, AI aligned left)
- Input box at bottom with send button
- Suggested prompts displayed when chat is empty
- File upload icon (for future multimodal support)

#### Reports Page

- List of all generated reports
- Filters: Report type, date range
- Preview thumbnail, report metadata
- Actions: Download, Share, Delete

#### Settings Page

- Tabs: Profile, Security, Notifications, Integrations, Billing (future)
- Profile: Name, email, organization, timezone
- Security: Password change, MFA setup (future), API keys (future)
- Notifications: Email preferences, severity threshold for alerts
- Integrations: Cloud account connections (AWS, Azure, GCP)

---

## Data Models & Database Schema

### Core Entities

#### Users

- id (UUID, primary key)
- email (unique, indexed)
- password_hash (bcrypt)
- name
- organization
- role (enum: user, admin)
- created_at
- last_login_at
- preferences (JSONB: timezone, notification settings)
- quota (JSONB: max_scans_per_month, storage_limit_mb)

#### Scans

- id (UUID, primary key)
- user_id (foreign key → users)
- target (text: URL, IP, cloud ARN)
- scan_type (enum: network, webapp, api, cloud, iot, config)
- status (enum: pending, running, completed, failed, cancelled)
- configuration (JSONB: all scan settings)
- started_at
- completed_at
- duration_seconds
- findings_count (computed)
- created_at

#### Findings

- id (UUID, primary key)
- scan_id (foreign key → scans)
- severity (enum: critical, high, medium, low, info)
- title (text, indexed for search)
- description (text, full-text search)
- affected_asset (text)
- cvss_score (numeric, nullable)
- cwe_id (text, nullable)
- evidence (JSONB: requests, responses, logs)
- ai_reasoning (JSONB: reasoning chain, confidence score)
- remediation (JSONB: steps, effort, priority)
- state (enum: new, confirmed, false_positive, remediated, accepted_risk)
- discovered_by_agent (text)
- discovered_at
- created_at
- updated_at

#### Reports

- id (UUID, primary key)
- scan_id (foreign key → scans, nullable if multi-scan report)
- user_id (foreign key → users)
- report_type (enum: executive, technical, compliance)
- file_url (text, Supabase Storage URL)
- file_size_bytes
- generated_at
- created_at

#### Agent_Activity_Logs

- id (UUID, primary key)
- scan_id (foreign key → scans)
- agent_name (text)
- action_description (text)
- status (enum: running, completed, error)
- timestamp
- metadata (JSONB: details, errors)

#### Chat_Messages

- id (UUID, primary key)
- user_id (foreign key → users)
- role (enum: user, assistant)
- content (text)
- context (JSONB: referenced scan_id, finding_id)
- timestamp

### Indexes & Performance Optimizations

**Critical Indexes**:

- users.email (unique index for fast login)
- scans.user_id + scans.created_at (for user's scan history)
- findings.scan_id (for retrieving all findings for a scan)
- findings.severity + findings.state (for filtered finding queries)
- findings.title, findings.description (full-text search index)

**Partitioning (Future)**:

- Partition findings table by month for large datasets

**Caching Strategy**:

- Dashboard metrics: Cache for 5 minutes
- Scan status: No cache (real-time via SSE)
- Finding lists: Cache for 1 minute

---

## Testing Strategy

### Testing Types

#### Unit Tests

- Agent logic (reconnaissance, scanning, exploit analysis)
- Utility functions (parsing, validation, formatting)
- API endpoint handlers
- Database query functions
  Coverage Target: 70% for MVP

#### Integration Tests

- End-to-end agent orchestration workflow
- Database interactions with Supabase
- LLM API calls with mock responses
- Authentication flows

#### Functional/End-to-End Tests (Post-MVP)

- User signup → scan creation → view findings → generate report
- Critical user journeys for each persona
- Cross-browser testing (Chrome, Firefox, Safari)

#### Security Tests

- SQL injection in user inputs
- XSS in finding evidence display
- JWT token validation
- Authorization bypass attempts (access other user's scans)
- Rate limiting enforcement

### Test Data

- Synthetic vulnerable application (e.g., OWASP Juice Shop, DVWA) for web app testing
- Mock cloud API responses for cloud testing
- Controlled test network for network scanning
- Known vulnerable packages for dependency scanning

---

## Deployment Strategy

### Deployment Environments

**Development**:

- Local environment for each developer
- Next.js dev server + Supabase local instance
- Environment: localhost:3000

**Staging**:

- Deployed on Vercel (preview deployment for feature branches)
- Shared Supabase staging database
- Environment: heimdall-staging.vercel.app
- Used for testing before production merge

**Production**:

- Deployed on Vercel (main branch auto-deploy)
- Production Supabase database
- Background workers on Railway (production environment)
- Environment: heimdall.ai (or custom domain)

### CI/CD Pipeline (GitHub Actions)

**On Pull Request**:

1. Checkout code
2. Install dependencies (yarn install)
3. Lint (ESLint)
4. Type check (TypeScript strict mode)
5. Run unit tests (Vitest)
6. Build verification (next build)
7. Deploy preview to Vercel
8. Comment on PR with preview URL

**On Merge to Main**:

1. All checks from PR pipeline
2. Deploy to Vercel (production)
3. Deploy workers to Railway (production)
4. Run smoke tests on production
5. Notify team in Slack

**Scheduled**:

- Daily: Dependency vulnerability scan (npm audit)
- Weekly: Full integration test suite against staging

### Rollback Strategy

- Vercel supports instant rollback to previous deployment
- Database migrations are versioned and reversible
- Feature flags for gradual rollout of risky changes (post-MVP)

---

## Success Metrics for MVP

### Technical Metrics

**System Performance**:

- 95% of scans complete successfully
- < 5% error rate in agent execution
- < 1 second API response time (P95)
- 99.5% uptime (excluding scheduled maintenance)

**Scan Quality**:

- < 10% false positive rate (as reported by users)
- 90% of findings actionable (user marks as confirmed or remediated)
- AI confidence score > 70% for 90% of findings

### User Engagement Metrics

**Adoption**:

- 50+ registered users within first month
- 20+ active users (at least 1 scan per week)
- 3+ scans per active user (indicates value found)

**Retention**:

- 60% of users return within 7 days
- 40% of users schedule recurring scans

**User Satisfaction**:

- Net Promoter Score (NPS) > 40
- User survey: "Would you recommend?" > 70% yes
- Average session duration > 5 minutes (indicates engagement)

### Business Validation Metrics

**Value Demonstration**:

- 80% of scans discover at least 1 High or Critical finding
- Users report saving 10+ hours per scan vs. manual testing
- 3+ users willing to pay for premium features (market validation)

**Hackathon-Specific**:

- Working demo completed on time
- Zero security violations during demo (authorized targets only)
- Judges rate solution as "innovative" and "production-ready"

---

## MVP Feature Prioritization

### Must-Have (P0) - Cannot Launch Without

- User authentication (email/password + Google OAuth)
- Network penetration testing (basic port scan, service detection, vulnerability lookup)
- Web application testing (OWASP Top 10 focus: SQLi, XSS, auth issues)
- API security testing (REST endpoint testing, BOLA, authentication)
- Cloud configuration review (AWS only for MVP: S3, IAM, security groups)
- Real-time scan progress display
- Findings list with severity and basic details
- PDF report generation (executive report minimum)
- Natural language scan initiation
- Dashboard with recent scans and metrics

### Should-Have (P1) - Important but Can Be Added Post-Launch

- IoT security testing (basic firmware analysis, default credential check)
- Build/config review (Dockerfile, package.json dependency scanning)
- Advanced filtering and search on findings
- Chat interface for querying findings
- Scheduled recurring scans
- Detailed technical reports (in addition to executive reports)
- Azure and GCP cloud support (in addition to AWS)

### Nice-to-Have (P2) - Adds Polish but Not Critical

- GraphQL API testing
- Finding comparison between scans
- Remediation progress tracking
- Export findings as CSV/JSON
- Multi-user team collaboration
- Comments on findings
- Custom branding on reports

### Future Roadmap (P3) - Beyond MVP

- Mobile application testing
- Red team simulation exercises
- Integration with ticketing systems (Jira, ServiceNow)
- Slack/email alerting for critical findings
- API for programmatic access
- Compliance workflow automation (SOC 2, ISO 27001)
- Advanced ML for anomaly detection

---

## Risks & Mitigations

### Technical Risks

**Risk: LLM API Rate Limits/Costs**

- Mitigation: Implement aggressive caching of LLM responses; use cheaper models for simple tasks; set per-user API usage quotas

**Risk: Scan Execution Timeouts**

- Mitigation: Set maximum scan duration (30 minutes); implement checkpoint/resume logic for long scans; move to background job queue

**Risk: False Positive Rate Too High**

- Mitigation: Multi-stage validation (automated check → AI reasoning → optional manual validation); train AI with real-world feedback loop; confidence scoring

**Risk: Database Performance Degradation**

- Mitigation: Implement pagination everywhere; archive old data; optimize queries with indexes; consider read replicas for heavy analytics

### Security Risks

**Risk: Accidental Testing of Unauthorized Targets**

- Mitigation: Mandatory target ownership verification; legal terms acceptance per scan; scope validation with user confirmation; block known public infrastructure IPs

**Risk: User Data Breach**

- Mitigation: Encrypt all sensitive data at rest; row-level security; security audit before launch; penetration test the platform itself

**Risk: Malicious Use (Using Tool for Attacks)**

- Mitigation: Audit logs of all scans; rate limiting; manual review of suspicious activity; terms of service with legal consequences; cooperation with law enforcement

### Business/Hackathon Risks

**Risk: Scope Creep (Trying to Build Too Much)**

- Mitigation: Strict adherence to P0 features only; ruthless prioritization; daily standup to realign on goals

**Risk: Demo Failure on Hackathon Day**

- Mitigation: Pre-recorded backup demo video; thorough testing 24 hours before; use known-good test targets; practice demo multiple times

**Risk: Complex Agent Logic Not Fully Functional**

- Mitigation: Fallback to simpler rule-based logic if AI reasoning fails; graceful degradation; focus on 2-3 solid testing types if 6 is too ambitious

---

## MVP Success Definition

The MVP will be considered successful if it demonstrates:

1. **End-to-End Functionality**: A user can sign up, configure a scan, watch it execute with visible AI agent activity, review findings with explanations, and download a professional report.

2. **AI-Powered Intelligence**: The system goes beyond simple vulnerability scanning to demonstrate reasoning about exploitability, attack chains, and business impact.

3. **Explainability**: Every decision the AI makes is traceable and understandable, building trust with users.

4. **Real Value**: The platform discovers meaningful vulnerabilities that users care about, not just noise and false positives.

5. **Production-Ready Foundation**: The architecture is scalable, maintainable, and ready to evolve beyond the MVP (not throwaway hackathon code).

6. **Hackathon Victory**: The demo clearly communicates the vision, impresses judges with execution quality, and wins the AI Pentester challenge.
