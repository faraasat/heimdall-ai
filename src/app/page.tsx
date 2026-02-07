import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Zap, Brain, Clock, Target, LineChart } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-sm bg-gray-950/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">HeimdallAI</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-gray-300 hover:text-white transition">
              Features
            </Link>
            <Link href="#testing-types" className="text-gray-300 hover:text-white transition">
              Testing Types
            </Link>
            <Link href="/login" className="text-gray-300 hover:text-white transition">
              Login
            </Link>
            <Link href="/signup">
              <Button variant="default">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Penetration Testing That Never Sleeps
          </h1>
          <p className="text-xl text-gray-400">
            Continuous, intelligent security testing using agentic AI. Discover vulnerabilities 
            before attackers do with 24/7 autonomous security assessment.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free Scan
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Why HeimdallAI?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border border-gray-800 rounded-xl bg-gray-900/50">
            <Brain className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Intelligence</h3>
            <p className="text-gray-400">
              Advanced LLMs reason about vulnerabilities, chain attack paths, and filter false positives with human-like intelligence.
            </p>
          </div>
          <div className="p-6 border border-gray-800 rounded-xl bg-gray-900/50">
            <Clock className="h-12 w-12 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Continuous Monitoring</h3>
            <p className="text-gray-400">
              24/7 autonomous testing eliminates blind spots between manual pentests. Security that never sleeps.
            </p>
          </div>
          <div className="p-6 border border-gray-800 rounded-xl bg-gray-900/50">
            <Zap className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">10x Faster</h3>
            <p className="text-gray-400">
              Results in minutes instead of weeks. Scale testing across your entire infrastructure instantly.
            </p>
          </div>
          <div className="p-6 border border-gray-800 rounded-xl bg-gray-900/50">
            <Target className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Comprehensive Coverage</h3>
            <p className="text-gray-400">
              6 specialized agents cover network, web, API, cloud, IoT, and configuration security in a single platform.
            </p>
          </div>
          <div className="p-6 border border-gray-800 rounded-xl bg-gray-900/50">
            <LineChart className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Actionable Reports</h3>
            <p className="text-gray-400">
              Get prioritized findings with step-by-step remediation guidance. Reports ready for your CISO and auditors.
            </p>
          </div>
          <div className="p-6 border border-gray-800 rounded-xl bg-gray-900/50">
            <Shield className="h-12 w-12 text-cyan-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Explainable AI</h3>
            <p className="text-gray-400">
              Every decision is transparent with reasoning chains. You understand exactly why each vulnerability matters.
            </p>
          </div>
        </div>
      </section>

      {/* Testing Types */}
      <section id="testing-types" className="container mx-auto px-4 py-20 bg-gray-900/20">
        <h2 className="text-4xl font-bold text-center mb-12">6 Specialized Testing Modes</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { name: 'Network Penetration', desc: 'Port scanning, service detection, network vulnerabilities' },
            { name: 'Web Application', desc: 'OWASP Top 10, authentication, business logic flaws' },
            { name: 'API Security', desc: 'REST, GraphQL, authentication, authorization testing' },
            { name: 'Cloud Security', desc: 'AWS, Azure, GCP configuration and IAM review' },
            { name: 'IoT Security', desc: 'Firmware analysis, protocol testing, device hardening' },
            { name: 'Config Review', desc: 'Dependency scanning, IaC security, baseline compliance' },
          ].map((type) => (
            <div key={type.name} className="p-6 border border-gray-800 rounded-xl bg-gray-900/50 hover:border-blue-500 transition">
              <h3 className="text-lg font-semibold mb-2">{type.name}</h3>
              <p className="text-sm text-gray-400">{type.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">Ready to Secure Your Infrastructure?</h2>
          <p className="text-xl text-gray-400">
            Start with a free scan and see what vulnerabilities AI can discover in minutes.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-12">
              Start Free Scan Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2026 HeimdallAI. Built for Deriv AI Talent Sprint Hackathon.</p>
        </div>
      </footer>
    </div>
  )
}
