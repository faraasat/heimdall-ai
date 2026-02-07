import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HeimdallAI - AI-Powered Penetration Testing",
  description:
    "Continuous, intelligent security testing using agentic AI that never sleeps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
          {/* Animated background */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          {/* Header */}
          <header className="border-b border-gray-800/50 backdrop-blur-xl bg-gray-950/60 sticky top-0 z-50 shadow-lg shadow-black/20">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <Shield className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-400/30 transition-all" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  HeimdallAI
                </span>
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="text-white font-semibold relative"
                >
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-500" />
                </Link>
                <Link
                  href="/dashboard/scans"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Scans
                </Link>
                <Link
                  href="/dashboard/findings"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Findings
                </Link>
                <Link
                  href="/settings"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Settings
                </Link>
                <form action="/api/auth/logout" method="POST">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 hover:border-gray-600"
                  >
                    Logout
                  </Button>
                </form>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
