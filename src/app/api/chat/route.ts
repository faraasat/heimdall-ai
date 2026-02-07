import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGroqModel, getGeminiModel } from "@/lib/ai/models";

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

  // Save user message
  await supabase.from("chat_messages").insert({
    user_id: user.id,
    role: "user",
    content,
    context: {},
  });

  // Get conversation history
  const { data: history } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", user.id)
    .order("timestamp", { ascending: true })
    .limit(20);

  // Get user's recent scans for context
  const { data: recentScans } = await supabase
    .from("scans")
    .select("id, name, target, status, findings_count, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get recent findings for context
  const { data: recentFindings } = await supabase
    .from("findings")
    .select("id, title, severity, affected_asset, scan_id")
    .in("scan_id", recentScans?.map((s) => s.id) || [])
    .order("discovered_at", { ascending: false })
    .limit(10);

  // Build context-aware prompt
  const systemPrompt = `You are HeimdallAI, an advanced AI-powered security testing assistant. You help users understand their security scans, findings, and provide guidance on remediation.

Current user context:
${recentScans && recentScans.length > 0 ? `
Recent Scans:
${recentScans.map((s) => `- ${s.name} (${s.target}): ${s.status} - ${s.findings_count} findings`).join("\n")}
` : "No recent scans."}

${recentFindings && recentFindings.length > 0 ? `
Recent Critical/High Findings:
${recentFindings.slice(0, 5).map((f) => `- [${f.severity}] ${f.title} on ${f.affected_asset}`).join("\n")}
` : "No recent findings."}

You can help with:
- Explaining security findings and their impact
- Providing remediation guidance
- Analyzing scan results
- Answering security best practices questions
- Initiating new scans (tell them to go to /dashboard/new-scan)

Be concise, helpful, and security-focused. If asked about specific scans or findings by ID, use the context provided.`;

  const conversationMessages = (history || []).map((msg) => ({
    role: msg.role as "system" | "user" | "assistant",
    content: msg.content,
  }));

  // Try to get AI response
  let assistantResponse: string;
  try {
    const model = await getGroqModel();
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      ...conversationMessages.slice(-10), // Last 10 messages for context
      { role: "user", content },
    ]);

    assistantResponse =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);
  } catch (groqError) {
    console.error("Groq failed, trying Gemini:", groqError);
    try {
      const geminiModel = await getGeminiModel();
      const response = await geminiModel.invoke([
        { role: "system", content: systemPrompt },
        ...conversationMessages.slice(-10),
        { role: "user", content },
      ]);

      assistantResponse =
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content);
    } catch (geminiError) {
      console.error("Gemini also failed:", geminiError);
      assistantResponse =
        "I'm having trouble connecting to my AI services right now. Please try again in a moment, or check out your scans directly in the dashboard.";
    }
  }

  // Save assistant response
  await supabase.from("chat_messages").insert({
    user_id: user.id,
    role: "assistant",
    content: assistantResponse,
    context: {
      scans_referenced: recentScans?.length || 0,
      findings_referenced: recentFindings?.length || 0,
    },
  });

  // Return updated messages
  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", user.id)
    .order("timestamp", { ascending: true })
    .limit(100);

  return NextResponse.json({ messages: messages || [] });
}
