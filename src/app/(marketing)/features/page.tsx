import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, Activity, Shield, ArrowRight } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Features
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          HeimdallAI combines autonomous agents, real-time monitoring, and explainable AI to
          produce actionable findings.
        </p>

        <div className="grid gap-6">
          <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-6 w-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Explainable AI Findings</h2>
            </div>
            <p className="text-gray-400">
              Each finding includes reasoning chains, confidence scoring, and guided remediation.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Real-Time Scan Activity</h2>
            </div>
            <p className="text-gray-400">
              Live streaming logs and agent activity with scan progress and status.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-6 w-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Coverage Across Scan Types</h2>
            </div>
            <p className="text-gray-400">
              Network, Web App, API, Cloud, IoT, and Config review in a single workflow.
            </p>
          </div>
        </div>

        <div className="mt-12 flex gap-4">
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-gray-700 hover:border-gray-600 text-white">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
