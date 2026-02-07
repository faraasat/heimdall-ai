# HeimdallAI — Technology Stack

This document defines the complete technology stack for HeimdallAI, organized by layer. Selections are optimized for hackathon speed, free-tier availability, and long-term scalability.

For whatever tools official cli is present for scaffolding, please prefer to use that.

---

## Stack Overview

| Layer            | Technology                                               |
| ---------------- | -------------------------------------------------------- |
| Frontend         | Next.js 16 (App Router)                                  |
| Styling          | Tailwind CSS + shadcn/ui                                 |
| State Management | Zustand                                                  |
| Backend          | Next.js API Routes + Route Handlers                      |
| Real-time        | Server-Sent Events (SSE)                                 |
| Database         | Supabase (PostgreSQL)                                    |
| Auth             | Supabase Auth                                            |
| AI / LLM         | Groq, Gemini, HuggingFace, g4f.dev, arena.ai, NVIDIA NIM |
| Agent Framework  | LangChain + LangGraph + kestra                           |
| Deployment       | Vercel (Frontend) + Railway (Workers)                    |
| File Storage     | Supabase Storage                                         |
| PDF Generation   | Puppeteer / React-PDF                                    |
| CI/CD            | GitHub Actions                                           |
| Monorepo         | Yarn v3 + Turborepo                                      |

---

## Frontend

### Framework: Next.js 16 (App Router)

**Why Next.js**: Recommended in the hackathon's "Golden Path" stack. App Router provides server components for performance, server actions for mutations, and middleware for auth checks. Built-in API routes eliminate the need for a separate backend service. Vercel deployment is zero-config.

**Key features used**:

- App Router with file-based routing
- Server Components for initial data fetching (dashboard, scan results)
- Client Components for interactive elements (chat, live scan view)
- Server Actions for form submissions and mutations
- Middleware for authentication guards
- Dynamic routes for scan detail pages (`/dashboard/scans/[id]`)
- Loading and error boundaries for each route segment
- Streaming for progressive page rendering

### Styling: Tailwind CSS

**Why Tailwind**: Fastest way to build polished, responsive UIs. Utility-first approach eliminates context switching. JIT compiler keeps bundle size minimal. First-class dark mode support.

**Configuration**:

- Custom color palette aligned with HeimdallAI brand
- Extended spacing and typography scales
- Dark mode via class strategy
- Custom animations for scan progress and agent activity indicators

### Component Library: shadcn/ui

**Why shadcn/ui**: Not a dependency — components are copied into the project and fully customizable. Built on Radix UI primitives, ensuring accessibility. Tailwind-native. No vendor lock-in. Components include: Button, Dialog, Dropdown, Table, Tabs, Toast, Card, Sheet, Command palette, and more.

**Key components used**:

- Data tables for scan lists and findings
- Cards for dashboard summary metrics
- Dialogs for scan configuration and confirmations
- Command palette for quick actions
- Sheet (slide-over) for the chat interface
- Tabs for scan result categorization
- Toast notifications for real-time alerts
- Charts (built on Recharts) for analytics visualizations

### Icons: Lucide Icons

**Why Lucide**: Open-source, consistent icon set with 1500+ icons. Tree-shakeable, so only used icons are bundled. React component-based.

### State Management: Zustand

**Why Zustand**: Minimal API surface (a single `create` call), no boilerplate, no providers. Perfect for managing client-side state like: active chat messages, UI preferences, real-time scan status, notification state.

**Stores**:

- `useScanStore`: Active scans, real-time agent activity, findings cache
- `useChatStore`: Chat messages, conversation history, pending responses
- `useUIStore`: Sidebar state, theme, modal state, notification queue

### Form Handling: React Hook Form + Zod

**Why**: React Hook Form provides performant, uncontrolled form handling. Zod provides TypeScript-first schema validation. Together they give type-safe forms with minimal re-renders.

**Used for**: Scan configuration forms, login/signup forms, profile settings, report filters.

### Data Fetching: TanStack Query (React Query)

**Why**: Automatic caching, background refetching, optimistic updates, retry logic, and devtools. Eliminates manual loading/error state management.

**Used for**: Dashboard data, scan lists, findings, reports, user profile — all server data that benefits from caching and automatic refetching.

---

## Backend

### API Layer: Next.js Route Handlers

**Why**: Colocated with the frontend, eliminating CORS issues. Full Node.js runtime access. Type-safe with TypeScript end-to-end. Serverless at Vercel scale.

**API Structure**:

- `/api/auth/*` — Authentication endpoints (handled by Supabase)
- `/api/scans/*` — Scan CRUD, initiation, status
- `/api/findings/*` — Finding retrieval, status updates
- `/api/reports/*` — Report generation and retrieval
- `/api/chat/*` — Chat message handling, LLM interaction
- `/api/agents/*` — Agent status, activity logs
- `/api/upload/*` — File upload handling
- `/api/health` — Health check endpoint

### Real-time: Server-Sent Events (SSE)

**Why SSE over WebSocket**: Simpler to implement, works over HTTP/2, auto-reconnects, sufficient for our use case (server → client streaming). No additional infrastructure needed (no WebSocket servers).

**Used for**:

- Live scan progress updates (phase changes, findings discovered)
- Agent activity feed (which agent is running, what it's doing)
- Chat response streaming (LLM responses streamed token by token)
- Real-time notification delivery

### Background Processing: BullMQ (if using Railway) or Vercel Background Functions

**Why**: Scan execution is long-running (5–15 minutes). It cannot run in a serverless function with a 30-second timeout. BullMQ provides reliable job queuing with Redis, retries, rate limiting, and concurrency control.

**Queue structure**:

- `scan-execution` queue: Long-running scan jobs
- `report-generation` queue: PDF generation jobs
- `notification` queue: Email and push notification delivery

**For hackathon MVP**: Long polling or SSE from a persistent Railway process. BullMQ for production.

---

## Database

### Primary Database: Supabase (PostgreSQL)

**Why Supabase**: PostgreSQL with a generous free tier. Built-in auth, storage, and real-time subscriptions. REST and GraphQL API auto-generated from schema. Dashboard for quick data inspection. Row-level security for multi-tenancy from day one.

**Key PostgreSQL features used**:

- JSONB columns for flexible data (scan configuration, findings evidence, AI reasoning chains)
- Full-text search for searching across findings and reports
- Indexes on frequently queried columns (user_id, scan_id, severity, status)
- Foreign key constraints for referential integrity
- Enums for status fields (scan_status, finding_severity, etc.)
- Timestamps with timezone for all temporal data

**Schema design principles**:

- Normalized core entities (Users, Scans, Findings, Reports)
- JSONB for semi-structured data that varies by finding type
- Soft deletes for audit trail preservation
- Created_at / updated_at on all tables
- UUID primary keys for security (no sequential IDs to enumerate)

### Caching: Vercel KV (Redis) or In-Memory

**Why**: Cache frequently accessed data (user sessions, scan status, dashboard aggregations). For hackathon, in-memory caching with a Map is sufficient. For production, Redis via Vercel KV or Upstash.

---

## Authentication

### Auth Provider: Supabase Auth

**Why**: Free tier supports unlimited users. Built-in providers for email/password and Google OAuth. JWT-based sessions. Row-level security integration with PostgreSQL. Handles password hashing, token refresh, and session management.

**Implementation**:

- Email/password registration with email format validation
- Google OAuth via Supabase's built-in OAuth provider
- JWT tokens stored in HttpOnly cookies (not localStorage)
- Middleware-based auth guards on protected routes
- Session refresh logic in the Supabase client SDK
- Row-level security policies tying data to `auth.uid()`

---

## AI & LLM Strategy

### Primary LLM: OpenAI GPT-4o (Use something free like Groq)

**Why GPT-4o**: Best-in-class reasoning capabilities for complex security analysis, attack chain reasoning, and false positive reduction. Used for high-stakes decisions where accuracy is critical.

**Use Cases**:

- Complex vulnerability analysis and exploitability assessment
- Attack chain correlation (chaining multiple vulnerabilities)
- False positive filtering with reasoning chains
- Technical report generation with detailed explanations
- Natural language understanding for chat interface

### Secondary LLM: Google Gemini

**Why Gemini**: Fast, cost-effective, with generous free tier. Gemini Flash for quick tasks, Gemini Pro for more complex analysis.

**Use Cases**:

- Quick classification tasks (severity assignment)
- Real-time chat responses
- Summarization and simple analysis
- Fallback when OpenAI quota is exceeded

### Additional LLM Options

- **Groq Cloud**: Ultra-fast inference for time-sensitive tasks
- **HuggingFace Models**: Open-source models for specific tasks (embeddings, classification)
- **NVIDIA NIM**: Future consideration for on-premises deployment
- **g4f.dev & arena.ai**: Free tier aggregators as additional fallbacks

### LLM Usage Strategy

**Cost Optimization**:

- Cache LLM responses aggressively (identical queries return cached results)
- Use cheaper models (Gemini Flash) for simple classification
- Use expensive models (GPT-4o) only for complex reasoning
- Implement request batching where possible
- Use LLMs where required and not on every request or output

**Reliability**:

- Multi-model fallback chain (GPT-4o → Gemini Pro → Groq)
- Retry logic with exponential backoff
- Circuit breakers to prevent cascading failures
- Rate limiting per user to prevent abuse

---

## Agent Framework

### LangChain + LangGraph

**Why LangChain**: Most mature agent framework with extensive tooling, comprehensive documentation, and active community. LangGraph enables complex, stateful agent workflows.

**Agent Architecture**:

**Orchestrator Agent** (Master Coordinator):

- Interprets user intent and scan configuration
- Determines which specialized agents to deploy
- Manages execution sequence and parallelization
- Handles inter-agent communication via shared state
- Enforces safety guardrails and scope boundaries

**Specialized Testing Agents** (Six Core Types):

1. **Network Penetration Agent**: Port scanning, service detection, network vulnerability assessment
2. **Web Application Agent**: OWASP Top 10 testing, authentication analysis, business logic flaws
3. **API Security Agent**: REST/GraphQL testing, BOLA/BFLA, authentication flows
4. **Cloud Security Agent**: AWS/Azure/GCP configuration review, IAM analysis, storage security
5. **IoT Security Agent**: Firmware analysis, protocol testing, device hardening assessment
6. **Configuration Review Agent**: Dependency scanning, IaC security, baseline compliance

**Supporting Agents**:

- **Reconnaissance Agent**: DNS enumeration, OSINT, technology fingerprinting
- **Scanner Agent**: Vulnerability signature matching, CVE correlation
- **Exploit Analysis Agent**: Exploitability assessment, attack chain reasoning
- **Report Agent**: Finding synthesis, report generation

**Agent Communication**:

- Shared memory via LangGraph state
- Message passing for inter-agent coordination
- Event-driven triggers (one agent's findings trigger another)
- Real-time status updates streamed to frontend

### Kestra (Workflow Orchestration)

**Why Kestra**: Open-source workflow orchestration for scheduled scans and complex multi-step scanning workflows.

**Use Cases**:

- Scheduled recurring scans (daily/weekly/monthly)
- Multi-stage scan pipelines (recon → scan → analysis → report)
- Conditional workflows (if critical finding, trigger alert)
- Integration with external systems (webhooks, notifications)

---

## Security Testing Tools (Integrated via Agents)

These are not UI tools — they are capabilities that the AI agents invoke programmatically to perform the **six core testing types**:

### 1. Network Penetration Testing Tools

**Port Scanning & Service Detection**:

- **Custom port scanner**: TCP SYN, ACK, UDP scanning with async Node.js
- **Service fingerprinting**: Banner grabbing, version detection
- **OS fingerprinting**: TTL analysis, TCP/IP stack fingerprinting

**Network Protocols**:

- **SSH/Telnet**: Authentication testing, weak credential detection
- **SMB**: Share enumeration, null session testing
- **LDAP**: Anonymous bind, injection testing
- **SNMP**: Community string enumeration

**Network Vulnerability Assessment**:

- **CVE correlation**: Match services to known vulnerabilities
- **Configuration weakness**: Default credentials, weak encryption
- **Network segmentation testing**: VLAN hopping attempts

### 2. Web Application Testing Tools

**HTTP Client & Crawling**:

- **Axios / node-fetch**: HTTP request engine for crafted requests
- **Cheerio**: HTML parsing for form and parameter extraction
- **Custom spider**: Recursive crawling with depth control

**Vulnerability Testing**:

- **SQL Injection payloads**: Error-based, blind, time-based detection
- **XSS payloads**: Reflected, stored, DOM-based testing
- **Command injection**: OS command execution detection
- **Template injection**: SSTI payload library
- **Authentication bypass**: Parameter tampering, session fixation
- **CSRF testing**: Token validation, SameSite cookie checks

**Security Headers**:

- **Header analysis**: CSP, HSTS, X-Frame-Options, X-XSS-Protection evaluation
- **Cookie security**: HttpOnly, Secure, SameSite attribute validation

### 3. API Security Testing Tools

**API Discovery & Mapping**:

- **OpenAPI/Swagger parser**: Specification parsing for endpoint discovery
- **GraphQL introspection**: Schema discovery via \_\_schema queries
- **Endpoint enumeration**: Wordlist-based API endpoint discovery

**Authentication & Authorization**:

- **JWT analysis**: Algorithm confusion, weak secrets, expiration testing
- **OAuth flow testing**: Authorization code, implicit flow vulnerabilities
- **API key exposure**: Header, query parameter key leakage
- **BOLA testing**: Object-level authorization bypass
- **BFLA testing**: Function-level authorization bypass

**API-Specific Vulnerabilities**:

- **Parameter pollution**: HTTP parameter pollution testing
- **Mass assignment**: Excessive data exposure detection
- **Rate limiting**: Bypass attempts, quota testing
- **GraphQL depth attacks**: Query depth limit testing

### 4. Cloud Security Testing Tools

**Cloud Provider SDKs**:

- **AWS SDK**: IAM, S3, EC2, security group analysis
- **Azure SDK**: Blob Storage, NSG, IAM role evaluation
- **GCP SDK**: Cloud Storage, VPC, IAM policy review

**Cloud Configuration Assessment**:

- **IAM privilege analysis**: Excessive permissions, privilege escalation paths
- **Storage security**: Public bucket detection, access policy review
- **Network security**: Security group rules, network ACL analysis
- **Secrets detection**: Hardcoded credentials in environment variables, config files
- **Logging validation**: CloudTrail, CloudWatch, Activity Log configuration

**IaC Security**:

- **Terraform analysis**: Security misconfigurations in .tf files
- **CloudFormation review**: Template security best practices
- **Helm chart analysis**: Kubernetes security context validation

### 5. IoT Security Testing Tools

**Firmware Analysis**:

- **binwalk**: Firmware unpacking and extraction
- **strings extraction**: Hardcoded credential discovery
- **Entropy analysis**: Encryption and obfuscation detection
- **Binary analysis**: Security feature identification (checksec equivalent)

**Protocol Testing**:

- **MQTT client**: Authentication, authorization, encryption testing
- **CoAP client**: Endpoint discovery and security validation
- **mDNS/SSDP**: Device discovery and information leakage
- **Custom protocol fuzzer**: Proprietary protocol vulnerability testing

**Network Analysis**:

- **Packet capture**: Unencrypted communication detection
- **Certificate validation**: SSL/TLS implementation review
- **Update mechanism**: OTA security, signature verification

### 6. Build Review / Configuration Review Tools

**Dependency Vulnerability Scanning**:

- **npm audit**: Node.js package vulnerability detection
- **pip audit**: Python package CVE correlation
- **Maven dependency check**: Java library vulnerability scanning
- **Snyk API**: Comprehensive multi-language dependency analysis

**Container Security**:

- **Dockerfile analysis**: Best practice validation, base image security
- **Image scanning**: Layer-by-layer vulnerability detection
- **Secret detection**: Hardcoded credentials in images

**Configuration Baseline**:

- **CIS Benchmark comparison**: OS and application hardening validation
- **DISA STIG compliance**: Security Technical Implementation Guide checks
- **Custom baseline rules**: Organization-specific security standards

**Infrastructure-as-Code**:

- **Terraform security**: Misconfiguration detection in IaC
- **CloudFormation validation**: AWS resource security review
- **Kubernetes manifest analysis**: Pod security policy, RBAC validation

---

## Supporting Security Tools

### DNS & Reconnaissance

- **dns module (Node.js built-in)**: DNS resolution, record lookups (A, AAAA, MX, NS, TXT, SOA, CNAME)
- **whois-json**: WHOIS domain registration lookups
- **Wappalyzer / Technology Lookup APIs**: Technology stack fingerprinting
- **SSL Labs API / tls module**: SSL/TLS certificate and cipher analysis
- **subfinder logic (reimplemented)**: Subdomain enumeration via wordlists and DNS brute-forcing

### Vulnerability Intelligence

- **NVD/CVE API**: National Vulnerability Database lookups with CVSS scoring
- **OSV API**: Open Source Vulnerability database for package CVEs
- **GitHub Advisory Database**: Real-time package vulnerability advisories
- **Exploit-DB correlation**: Link vulnerabilities to public exploits
- **MITRE ATT&CK mapping**: Technique and tactic correlation
- **Custom CVE mapping**: Version-to-vulnerability correlation engine
- **Threat intelligence feeds**: Integration for active exploitation data

---

## File Storage

### Supabase Storage

**Why**: Integrated with Supabase Auth (RLS for file access). Free tier includes 1GB. Simple API.

**Used for**:

- Uploaded package manifests (package.json, requirements.txt)
- Generated PDF reports
- Scan artifacts and evidence (screenshots, response dumps)
- User avatars

---

## PDF Generation

### Primary: React-PDF (@react-pdf/renderer)

**Why**: Generate PDFs using React components — same component model as the rest of the app. Full control over layout, styling, and content. No headless browser needed.

### Fallback: Puppeteer

**Why**: If complex layouts are needed, render the HTML report in headless Chrome and export as PDF. Higher fidelity but slower and heavier.

---

## Deployment & Infrastructure

### Frontend + API: Vercel

**Why**: Zero-config Next.js deployment. Global CDN. Automatic HTTPS. Preview deployments for every PR. Generous free tier (100GB bandwidth, 100 hours serverless). Edge functions for middleware.

**Configuration**:

- Production branch: `main`
- Preview branches: `dev`, feature branches
- Environment variables managed via Vercel dashboard
- Custom domain configuration

### Background Workers: Railway

**Why**: Persistent processes for long-running scan execution. Free tier includes 500 hours/month. Supports Node.js natively. Easy deployment from GitHub.

**Used for**:

- Scan execution workers (agents run here, not in serverless functions)
- Queue processing (BullMQ consumers)
- Scheduled scan execution (cron jobs)

### Database & Auth & Storage: Supabase

- Free tier: 500MB database, 1GB storage, 50K monthly active users
- Hosted PostgreSQL with connection pooling
- Auto-generated REST API + GraphQL
- Real-time subscriptions via WebSocket (for future use)

---

## DevOps & CI/CD

### Version Control: GitHub

- Monorepo structure (using yarn v3 and turborepo)
- Branch protection on `main` (require PR, require CI pass)
- Conventional commits for changelog generation
- Issue tracking with labels and milestones

### CI/CD: GitHub Actions

- **On PR**: Lint (ESLint), Type Check (TypeScript), Unit Tests (Vitest), Build Verification
- **On merge to main**: Automatic deployment to Vercel (frontend) and Railway (workers)
- **Scheduled**: Dependency vulnerability scanning (npm audit)

### Code Quality

- **ESLint**: Code linting with Next.js and TypeScript rules
- **Prettier**: Code formatting (enforced via pre-commit hook)
- **TypeScript**: Strict mode enabled, no `any` types
- **Husky + lint-staged**: Pre-commit hooks for lint and format

---

## Testing

### Unit Testing: Vitest

**Why**: Faster than Jest, native ESM support, compatible with Jest API. Used for testing agent logic, utility functions, API handlers.

### Component Testing: React Testing Library

**Why**: Test components the way users interact with them. Query by role, text, label — not implementation details.

### E2E Testing (Post-MVP): Playwright

**Why**: Cross-browser testing, reliable selectors, built-in assertions. Used for critical user flows (signup, scan, view results).

### API Testing: Hoppscotch / Postman

**Why**: Manual API testing during development. Collection of all API endpoints for team reference.

---

## Third-Party APIs & Services

| Service            | Purpose                        | Free Tier                      |
| ------------------ | ------------------------------ | ------------------------------ |
| Groq               | Primary LLM for reasoning      | $5 free credits (new accounts) |
| Google Gemini API  | Secondary LLM (fast tasks)     | Generous free tier             |
| Groq Cloud         | Fallback LLM (ultra-fast)      | Free tier available            |
| NVD/CVE API        | Vulnerability database lookups | Free, rate-limited             |
| OSV API            | Open-source vulnerability data | Free                           |
| GitHub Advisory DB | Package vulnerability data     | Free                           |
| Supabase           | Database, auth, storage        | Free tier (generous)           |
| Vercel             | Hosting and deployment         | Free tier (hobby)              |
| Railway            | Background worker hosting      | Free tier (500 hrs/mo)         |
| Resend             | Transactional emails           | Free tier (100 emails/day)     |
