import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Activity } from "lucide-react";

export default async function ScansIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: scans } = await supabase
    .from("scans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Scans</h1>
          <p className="text-gray-400">Scan history and live activity</p>
        </div>
        <Link href="/dashboard/new-scan">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Scan
          </Button>
        </Link>
      </div>

      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Recent Scans
          </CardTitle>
          <CardDescription className="text-gray-400">
            Click a scan to view details, findings, and activity logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {scans && scans.length > 0 ? (
            scans.map((scan) => (
              <Link key={scan.id} href={`/dashboard/scans/${scan.id}`}>
                <div className="group flex items-center justify-between p-4 border border-gray-800 bg-gray-950/40 rounded-xl hover:border-gray-700 hover:bg-gray-900/60 transition-all">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                        {scan.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          scan.status === "running"
                            ? "border-blue-500/50 text-blue-300"
                            : scan.status === "completed"
                              ? "border-green-500/50 text-green-300"
                              : scan.status === "failed"
                                ? "border-red-500/50 text-red-300"
                                : "border-gray-600 text-gray-300"
                        }
                      >
                        {scan.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{scan.target}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {scan.scan_types?.map((t: string) => (
                        <Badge key={t} variant="outline" className="border-gray-700 text-gray-300">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-6 shrink-0">
                    <div className="text-xs text-gray-400">Findings</div>
                    <div className="text-2xl font-bold text-white">{scan.findings_count || 0}</div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No scans yet</p>
              <p className="text-sm text-gray-500 mt-2">Start your first scan to see activity here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
