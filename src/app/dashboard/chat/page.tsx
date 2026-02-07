"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    })();
  }, []);

  const send = async () => {
    const value = text.trim();
    if (!value) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setText("");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Chat</h1>
        <p className="text-gray-400">Ask questions about your scans and findings</p>
      </div>

      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[480px] overflow-y-auto space-y-3 p-3 rounded-lg border border-gray-800 bg-gray-950/40">
            {messages.length === 0 ? (
              <div className="text-gray-500">No messages yet.</div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[80%] p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                      : "mr-auto max-w-[80%] p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
                  }
                >
                  <div className="text-xs text-gray-500 mb-1">{m.role}</div>
                  <div className="text-white whitespace-pre-wrap">{m.content}</div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask about a scan…"
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <Button
              onClick={() => void send()}
              disabled={sending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
