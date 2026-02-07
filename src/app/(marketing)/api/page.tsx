import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ApiPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          API
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          Core endpoints used by the MVP UI.
        </p>
        <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-sm">
          <ul className="space-y-2 text-gray-300">
            <li><span className="text-gray-400">GET</span> /api/scans</li>
            <li><span className="text-gray-400">POST</span> /api/scans</li>
            <li><span className="text-gray-400">GET</span> /api/scans/[id]</li>
            <li><span className="text-gray-400">GET</span> /api/scans/[id]/stream</li>
            <li><span className="text-gray-400">GET</span> /api/findings</li>
            <li><span className="text-gray-400">GET</span> /api/findings/[id]</li>
            <li><span className="text-gray-400">PATCH</span> /api/findings/[id]/state</li>
            <li><span className="text-gray-400">GET</span> /api/dashboard/stats</li>
          </ul>
        </div>
        <div className="mt-12 flex gap-4">
          <Link href="/docs">
            <Button variant="outline" className="border-gray-700 hover:border-gray-600 text-white">
              Docs
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
