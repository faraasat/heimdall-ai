import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", user.id)
    .order("generated_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-gray-400">Export and review scan reports</p>
      </div>

      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-400" />
            Generated Reports
          </CardTitle>
          <CardDescription className="text-gray-400">
            Executive, technical, and compliance reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reports && reports.length > 0 ? (
            reports.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-950/40">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{r.report_type} report</p>
                    <Badge variant="outline" className="border-gray-700 text-gray-300">
                      {r.report_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Generated: {new Date(r.generated_at).toLocaleString()}
                  </p>
                </div>
                {r.file_url ? (
                  <Link href={r.file_url}>
                    <Button variant="outline" className="border-gray-700 hover:border-gray-600 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="border-gray-700 text-gray-400" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Not available
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-gray-400">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold text-white mb-2">No Reports Generated Yet</p>
              <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                Reports are generated after scans complete. Visit your completed scans to export findings as executive, technical, or compliance reports.
              </p>
              <Link href="/dashboard/scans">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                  View Scans
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
