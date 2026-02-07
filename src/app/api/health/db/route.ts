import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isSchemaCacheMissingTableError(err: any): boolean {
  const message = typeof err?.message === "string" ? err.message : "";
  return err?.code === "PGRST205" || message.toLowerCase().includes("schema cache");
}

export async function GET() {
  const supabase = await createClient();

  // We intentionally do not require auth here.
  // This endpoint is meant to help during initial setup.
  try {
    const { error: scansError } = await supabase
      .from("scans")
      .select("id", { head: true, count: "exact" })
      .limit(1);

    if (scansError) {
      if (isSchemaCacheMissingTableError(scansError)) {
        return NextResponse.json(
          {
            ok: false,
            reason: "schema_missing",
            message:
              "Supabase does not have the required tables (e.g. public.scans) or the schema cache is stale.",
            fix:
              "Run supabase-schema.sql in the Supabase SQL editor (or apply the Supabase CLI migration), then reload the schema cache.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { ok: false, reason: "query_failed", message: scansError.message, code: scansError.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, reason: "exception", message: e?.message || String(e) },
      { status: 500 }
    );
  }
}
