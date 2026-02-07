import { NextRequest, NextResponse } from "next/server";
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

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", user.id)
    .order("timestamp", { ascending: true })
    .limit(100);

  return NextResponse.json({ messages: messages || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  await supabase.from("chat_messages").insert({
    user_id: user.id,
    role: "user",
    content,
    context: {},
  });

  // MVP: store a placeholder assistant reply.
  await supabase.from("chat_messages").insert({
    user_id: user.id,
    role: "assistant",
    content: "Got it. Open a scan detail page to review live activity and findings.",
    context: {},
  });

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", user.id)
    .order("timestamp", { ascending: true })
    .limit(100);

  return NextResponse.json({ messages: messages || [] });
}
