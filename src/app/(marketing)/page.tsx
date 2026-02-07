import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Zap,
  Brain,
  Clock,
  Target,
  LineChart,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <>
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
            before attackers do with 24/7 autonomous security assessment.
          </p>

          <div className="flex gap-4 justify-center pt-6 animate-fade-in-up delay-300">
            <Link href="/signup">
              <Button
                size="lg"
                className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/60 transition-all group"
              >
                Start Free Scan
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/features">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-6 border-gray-700 hover:border-gray-600 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all text-white"
              >
                Explore Features
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

      {/* Highlights */}
      <section className="relative container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Why HeimdallAI?
          </h2>
          <p className="text-gray-400 text-lg">
            Enterprise-grade security testing powered by explainable AI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "Explainable AI",
              desc: "Reasoning chains and confidence scoring for every finding.",
              color: "from-cyan-500 to-blue-500",
              bgColor: "bg-cyan-500/10",
              borderColor: "border-cyan-500/20",
            },
            {
              icon: Clock,
              title: "Real-Time Monitoring",
              desc: "Live scan progress, agent activity, and streaming logs.",
              color: "from-purple-500 to-pink-500",
              bgColor: "bg-purple-500/10",
              borderColor: "border-purple-500/20",
            },
            {
              icon: LineChart,
              title: "Actionable Reports",
              desc: "Executive-ready summaries and technical remediation guidance.",
              color: "from-green-500 to-emerald-500",
              bgColor: "bg-green-500/10",
              borderColor: "border-green-500/20",
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group relative p-8 border ${feature.borderColor} ${feature.bgColor} rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer`}
              >
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testing Types */}
      <section className="relative container mx-auto px-4 py-24 bg-gray-900/20 backdrop-blur-sm rounded-3xl my-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Testing Modes
          </h2>
          <p className="text-gray-400 text-lg">
            Web, API, Network, Cloud, IoT, and Configuration reviews.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { name: "Network", desc: "Port scanning, service detection, network issues", icon: "🔍" },
            { name: "Web Application", desc: "OWASP Top 10 and auth testing", icon: "🌐" },
            { name: "API Security", desc: "REST/GraphQL and authz checks", icon: "⚡" },
            { name: "Cloud", desc: "IAM and configuration review", icon: "☁️" },
            { name: "IoT", desc: "Device and protocol checks", icon: "📡" },
            { name: "Config", desc: "Baseline and best-practice review", icon: "⚙️" },
          ].map((type) => (
            <div
              key={type.name}
              className="group p-6 border border-gray-800 bg-gray-900/50 rounded-xl hover:border-blue-500/50 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer backdrop-blur-sm"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {type.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{type.name}</h3>
              <p className="text-sm text-gray-400">{type.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <div className="relative max-w-4xl mx-auto text-center p-16 border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <div className="relative space-y-6">
            <h2 className="text-5xl font-bold text-white">
              Ready to secure your infrastructure?
            </h2>
            <p className="text-xl text-gray-400">
              Start a scan and monitor agent activity live.
            </p>
            <div className="flex gap-4 justify-center pt-6">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="text-lg px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/60 transition-all group"
                >
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
    </>
  );
}
