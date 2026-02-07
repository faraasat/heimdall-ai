import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: finding, error: findError } = await supabase
    .from("findings")
    .select("*")
    .eq("id", id)
    .single();

  if (findError || !finding) {
    return NextResponse.json({ error: "Finding not found" }, { status: 404 });
  }

  // RLS should ensure user can only see their own.
  return NextResponse.json({ finding });
}
