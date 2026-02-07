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

  const body = await request.json();
  const { content, messages, context, mode } = body;

  // Determine if this is scan-specific assistant mode
  const isScanAssistant = mode === 'scan_assistant' && context?.type === 'scan';

  // Guardrails: Check for out-of-scope queries
  const outOfScopePatterns = [
    /write.*code/i,
    /create.*website/i,
    /build.*app/i,
    /how.*weather/i,
    /who.*president/i,
    /tell.*joke/i,
    /play.*game/i,
    /movie.*recommend/i,
    /recipe/i,
    /sports/i,
    /news/i,
  ];

  const contentToCheck = content || messages?.[messages.length - 1]?.content || '';
  const isOutOfScope = outOfScopePatterns.some(pattern => pattern.test(contentToCheck));

  if (isOutOfScope && !contentToCheck.toLowerCase().includes('security') && !contentToCheck.toLowerCase().includes('vulnerability')) {
    return NextResponse.json({
      response: `I'm HeimdallAI, a specialized security testing assistant. I can only help with:

🔒 Security scan analysis and findings
🛡️ Vulnerability explanations and remediation
📊 Explainable AI insights (SHAP, LIME, counterfactuals)
🎯 Risk prioritization and mitigation strategies
⚙️ Security configuration recommendations

For other topics, please consult a general-purpose AI assistant. How can I help with your security needs?`
    });
  }

  // Build context-aware prompt
  let systemPrompt = `You are HeimdallAI, an advanced AI-powered security testing assistant with Explainable AI (XAI) capabilities.`;

  if (isScanAssistant) {
    // Scan-specific assistant mode with full context
    systemPrompt += `

**SCAN CONTEXT:**
- Scan Name: ${context.scan_name}
- Target: ${context.target}
- Status: ${context.status}
- Scan Types: ${context.scan_types?.join(', ') || 'N/A'}
- Total Findings: ${context.findings_count}
- Severity Breakdown:
  • Critical: ${context.findings_summary?.critical || 0}
  • High: ${context.findings_summary?.high || 0}
  • Medium: ${context.findings_summary?.medium || 0}
  • Low: ${context.findings_summary?.low || 0}

**TOP FINDINGS:**
${context.top_findings?.map((f: any, i: number) => 
  `${i + 1}. [${f.severity.toUpperCase()}] ${f.title}
   Asset: ${f.affected_asset}
   Description: ${f.description}`
).join('\n') || 'No findings yet.'}

**YOUR CAPABILITIES:**
1. Explain vulnerabilities in simple terms
2. Provide SHAP analysis (feature importance)
3. Generate LIME explanations (local interpretability)
4. Suggest counterfactual scenarios (what-if analysis)
5. Extract anchor rules (key conditions)
6. Show integrated gradients (attribution)
7. Prioritize remediation steps
8. Answer technical security questions

**GUARDRAILS:**
- ONLY answer questions about THIS SCAN and security topics
- Politely decline off-topic questions (weather, jokes, etc.)
- If asked about other scans, clarify you're focused on this specific scan
- If asked to perform actions (run scans, fix code), explain you're read-only

**RESPONSE STYLE:**
- Be concise but thorough
- Use security terminology appropriately
- Provide actionable insights
- When explaining XAI, use clear examples
- Format with markdown for readability`;
  } else {
    // General security assistant mode
    const { data: recentScans } = await supabase
      .from("scans")
      .select("id, name, target, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: recentFindings } = await supabase
      .from("findings")
      .select("id, title, severity, affected_asset, scan_id")
      .in("scan_id", recentScans?.map((s) => s.id) || [])
      .order("discovered_at", { ascending: false })
      .limit(10);

    systemPrompt += `

**USER CONTEXT:**
${recentScans && recentScans.length > 0 ? `
Recent Scans:
${recentScans.map((s) => `- ${s.name} (${s.target}): ${s.status}`).join("\n")}
` : "No recent scans."}

${recentFindings && recentFindings.length > 0 ? `
Recent Findings:
${recentFindings.slice(0, 5).map((f) => `- [${f.severity}] ${f.title}`).join("\n")}
` : "No recent findings."}

**YOUR CAPABILITIES:**
- Explain security concepts and findings
- Guide users through scan results
- Provide remediation recommendations
- Answer security best practices questions
- Direct users to relevant dashboard sections

**GUARDRAILS:**
- ONLY answer security-related questions
- Decline general knowledge, jokes, weather, etc.
- Keep responses focused on HeimdallAI platform
- If asked to write code, suggest they check our documentation

**RESPONSE STYLE:**
- Concise and professional
- Security-focused
- Helpful and actionable`;
  }

  let conversationMessages = messages || [];
  if (content && !messages) {
    // Save user message for general chat
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "user",
      content,
      context: {},
    });

    const { data: history } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("timestamp", { ascending: true })
      .limit(20);

    conversationMessages = (history || []).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  // Get AI response with error handling
  let assistantResponse: string;
  try {
    const model = await getGroqModel();
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      ...conversationMessages.slice(-10),
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
      ]);

      assistantResponse =
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content);
    } catch (geminiError) {
      console.error("Both AI services failed:", geminiError);
      assistantResponse =
        "I'm having trouble connecting to my AI services right now. Please try again in a moment.";
    }
  }

  if (isScanAssistant) {
    // Return response directly for scan assistant
    return NextResponse.json({ response: assistantResponse });
  } else {
    // Save and return for general chat
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "assistant",
      content: assistantResponse,
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
}
