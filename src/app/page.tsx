import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Zap, Brain, Clock, Target, LineChart, ArrowRight, CheckCircle2, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-xl bg-gray-950/60 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Shield className="h-9 w-9 text-blue-500 group-hover:text-blue-400 transition-colors" />
              <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-400/30 transition-all" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              HeimdallAI
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all" />
            </Link>
            <Link href="#testing-types" className="text-gray-300 hover:text-white transition-colors relative group">
              Testing Types
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all" />
            </Link>
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/60">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-24 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Powered by Advanced AI Agents
          </div>
          
          <h1 className="text-7xl font-bold leading-tight animate-fade-in-up">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              AI-Powered Security
            </span>
            <br />
            <span className="text-white">That Never Sleeps</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Continuous, intelligent penetration testing using agentic AI. Discover vulnerabilities 
            before attackers do with 24/7 autonomous security assessment powered by LangChain and cutting-edge LLMs.
          </p>
          
          <div className="flex gap-4 justify-center pt-6 animate-fade-in-up delay-300">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/60 transition-all group">
                Start Free Scan
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-gray-700 hover:border-gray-600 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all">
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-16 animate-fade-in-up delay-400">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">10x</div>
              <div className="text-gray-400 text-sm">Faster Than Manual</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-400 text-sm">Continuous Testing</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">6</div>
              <div className="text-gray-400 text-sm">Specialized Agents</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Why Choose HeimdallAI?
          </h2>
          <p className="text-gray-400 text-lg">Enterprise-grade security testing powered by artificial intelligence</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "AI-Powered Intelligence",
              desc: "Advanced LLMs reason about vulnerabilities, chain attack paths, and filter false positives with human-like intelligence.",
              color: "from-blue-500 to-cyan-500",
              bgColor: "bg-blue-500/10",
              borderColor: "border-blue-500/20"
            },
            {
              icon: Clock,
              title: "Continuous Monitoring",
              desc: "24/7 autonomous testing eliminates blind spots between manual pentests. Security that never sleeps.",
              color: "from-purple-500 to-pink-500",
              bgColor: "bg-purple-500/10",
              borderColor: "border-purple-500/20"
            },
            {
              icon: Zap,
              title: "10x Faster",
              desc: "Results in minutes instead of weeks. Scale testing across your entire infrastructure instantly.",
              color: "from-yellow-500 to-orange-500",
              bgColor: "bg-yellow-500/10",
              borderColor: "border-yellow-500/20"
            },
            {
              icon: Target,
              title: "Comprehensive Coverage",
              desc: "6 specialized agents cover network, web, API, cloud, IoT, and configuration security in a single platform.",
              color: "from-red-500 to-pink-500",
              bgColor: "bg-red-500/10",
              borderColor: "border-red-500/20"
            },
            {
              icon: LineChart,
              title: "Actionable Reports",
              desc: "Get prioritized findings with step-by-step remediation guidance. Reports ready for your CISO and auditors.",
              color: "from-green-500 to-emerald-500",
              bgColor: "bg-green-500/10",
              borderColor: "border-green-500/20"
            },
            {
              icon: Shield,
              title: "Explainable AI",
              desc: "Every decision is transparent with reasoning chains. You understand exactly why each vulnerability matters.",
              color: "from-cyan-500 to-blue-500",
              bgColor: "bg-cyan-500/10",
              borderColor: "border-cyan-500/20"
            },
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={`group relative p-8 border ${feature.borderColor} ${feature.bgColor} rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" />
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Testing Types */}
      <section id="testing-types" className="relative container mx-auto px-4 py-24 bg-gray-900/20 backdrop-blur-sm rounded-3xl my-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            6 Specialized Testing Modes
          </h2>
          <p className="text-gray-400 text-lg">Comprehensive security coverage across your entire tech stack</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { name: 'Network Penetration', desc: 'Port scanning, service detection, network vulnerabilities', icon: '🔍' },
            { name: 'Web Application', desc: 'OWASP Top 10, authentication, business logic flaws', icon: '🌐' },
            { name: 'API Security', desc: 'REST, GraphQL, authentication, authorization testing', icon: '⚡' },
            { name: 'Cloud Security', desc: 'AWS, Azure, GCP configuration and IAM review', icon: '☁️' },
            { name: 'IoT Security', desc: 'Firmware analysis, protocol testing, device hardening', icon: '📡' },
            { name: 'Config Review', desc: 'Dependency scanning, IaC security, baseline compliance', icon: '⚙️' },
          ].map((type, index) => (
            <div
              key={type.name}
              className="group p-6 border border-gray-800 bg-gray-900/50 rounded-xl hover:border-blue-500/50 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{type.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{type.name}</h3>
              <p className="text-sm text-gray-400">{type.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-white">Trusted by Security Teams</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { metric: "99.9%", label: "Uptime" },
              { metric: "< 1min", label: "Scan Start Time" },
              { metric: "500+", label: "Vulnerabilities Detected" },
            ].map((stat) => (
              <div key={stat.label} className="p-6 border border-gray-800 bg-gray-900/50 rounded-xl backdrop-blur-sm">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.metric}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <div className="relative max-w-4xl mx-auto text-center p-16 border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <div className="relative space-y-6">
            <h2 className="text-5xl font-bold text-white">Ready to Secure Your Infrastructure?</h2>
            <p className="text-xl text-gray-400">
              Start with a free scan and see what vulnerabilities AI can discover in minutes.
            </p>
            <div className="flex gap-4 justify-center pt-6">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/60 transition-all group">
                  Start Free Scan Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 pt-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                5-minute setup
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 bg-gray-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-bold text-white">HeimdallAI</span>
            </div>
            <div className="text-gray-400 text-center">
              <p>&copy; 2026 HeimdallAI. Built for Deriv AI Talent Sprint Hackathon.</p>
            </div>
            <div className="flex gap-6 text-gray-400">
              <Link href="/docs" className="hover:text-white transition">Docs</Link>
              <Link href="/api" className="hover:text-white transition">API</Link>
              <Link href="/support" className="hover:text-white transition">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
