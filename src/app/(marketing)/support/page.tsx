import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Support
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          For the hackathon demo, support is handled by the team directly.
        </p>
        <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-sm">
          <p className="text-gray-300">
            If something looks off, check scan logs and the scan detail page first.
          </p>
        </div>
        <div className="mt-12 flex gap-4">
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white">
              Go to Dashboard
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
