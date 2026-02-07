"use client"

import { Shield, LayoutDashboard, ScanSearch, AlertTriangle, FileText, MessageSquare, Settings, ShieldCheck, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/scans", label: "Scans", icon: ScanSearch },
  { href: "/dashboard/findings", label: "Findings", icon: AlertTriangle },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/admin", label: "Admin", icon: ShieldCheck },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsAdmin(userData?.role === 'admin')
      }
    }
    checkAdminStatus()
  }, [])

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className={`hidden md:block shrink-0 transition-all duration-300 z-2 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="sticky top-0 h-[calc(100vh-73px)] border-r border-gray-800/50 bg-gray-950/40 backdrop-blur-sm">
        <div className="flex items-center justify-between h-16 px-4 pt-4">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 group ${isCollapsed ? 'justify-center w-full' : ''}`}
          >
            <div className="relative">
              <Shield className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
              <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-400/30 transition-all" />
            </div>
            {!isCollapsed && (
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                HeimdallAI
              </span>
            )}
          </Link>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {isCollapsed && (
          <div className="flex justify-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(false)}
              className="text-gray-400 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <nav className="p-4 space-y-1 mt-2">
          {navItems.map((item) => {
            // Hide admin tab if user is not admin
            if (item.href === '/dashboard/admin' && !isAdmin) {
              return null
            }

            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <div key={item.href} className="relative group z-2">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all ${
                    active
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border-l-2 border-blue-500'
                      : 'text-gray-300 hover:text-white hover:bg-gray-900/60'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-blue-400' : ''} shrink-0`} />
                  {!isCollapsed && <span>{item.label}</span>}
                  {active && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </Link>
                
                {/* Tooltip on hover when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-2">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className={`w-full text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-300 hover:border-red-400/50 transition-all ${
              isCollapsed ? 'px-2' : ''
            }`}
          >
            <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-2'}`} />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
