import "../globals.css";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <DashboardNavbar />
      <div className="relative flex">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
