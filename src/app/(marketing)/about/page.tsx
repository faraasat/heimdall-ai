import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          About
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          HeimdallAI is an AI-powered penetration testing platform built to run continuous,
          authorized security testing using specialized agents and transparent, explainable
          findings.
        </p>

        <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Ethics & Safety</h2>
          </div>
          <p className="text-gray-400">
            Scans are designed for authorized targets only, with clear scope confirmation and
            controls to prevent unsafe behavior.
          </p>
        </div>

        <div className="mt-12 flex gap-4">
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white">
              Create an account
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
