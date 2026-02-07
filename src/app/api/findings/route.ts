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
    .select("id")
    .eq("user_id", user.id);

  const scanIds = (scans || []).map((s: any) => s.id);
  if (scanIds.length === 0) {
    return NextResponse.json({ findings: [] });
  }

  const { data: findings, error: findingsError } = await supabase
    .from("findings")
    .select("*")
    .in("scan_id", scanIds)
    .order("created_at", { ascending: false })
    .limit(200);

  if (findingsError) {
    return NextResponse.json({ error: "Failed to fetch findings" }, { status: 500 });
  }

  return NextResponse.json({ findings: findings || [] });
}
