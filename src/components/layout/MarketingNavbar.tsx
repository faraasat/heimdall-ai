import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";

export function MarketingNavbar() {
  return (
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
          <Link
            href="/features"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="/about"
            className="text-gray-300 hover:text-white transition-colors"
          >
            About
          </Link>
          <Link
            href="/login"
            className="text-gray-300 hover:text-white transition-colors"
          >
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
  );
}
