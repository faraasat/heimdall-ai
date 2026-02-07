import Link from "next/link";
import { Shield } from "lucide-react";

export function MarketingFooter() {
  return (
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
            <Link href="/docs" className="hover:text-white transition">
              Docs
            </Link>
            <Link href="/api" className="hover:text-white transition">
              API
            </Link>
            <Link href="/support" className="hover:text-white transition">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
