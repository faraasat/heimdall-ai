import { Shield } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/scans", label: "Scans" },
  { href: "/dashboard/findings", label: "Findings" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/chat", label: "Chat" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/admin", label: "Admin" },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden md:block w-64 shrink-0">
      <div className="sticky top-0 h-[calc(100vh-73px)] border-r border-gray-800/50 bg-gray-950/40 backdrop-blur-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group h-16 pl-6 pt-4"
        >
          <div className="relative">
            <Shield className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
            <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-400/30 transition-all" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            HeimdallAI
          </span>
        </Link>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-900/60 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
