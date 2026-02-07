import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: scans } = await supabase
    .from("scans")
    .select("id,status,findings_count")
    .eq("user_id", user.id);

  const { data: findings } = await supabase
    .from("findings")
    .select("id,severity,state,scan_id");

  const scanCounts = (scans || []).reduce<Record<string, number>>((acc, s: any) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  const findingCountsBySeverity = (findings || []).reduce<Record<string, number>>(
    (acc, f: any) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    },
    {}
  );

  const findingCountsByState = (findings || []).reduce<Record<string, number>>(
    (acc, f: any) => {
      acc[f.state] = (acc[f.state] || 0) + 1;
      return acc;
    },
    {}
  );

  return NextResponse.json({
    scans: {
      total: scans?.length || 0,
      byStatus: scanCounts,
    },
    findings: {
      total: findings?.length || 0,
      bySeverity: findingCountsBySeverity,
      byState: findingCountsByState,
    },
  });
}
