"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Bot, User, AlertCircle, Shield, Sparkles } from "lucide-react"
import type { Scan, Finding } from "@/lib/types/database"

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ScanChatProps {
  scan: Scan
  findings: Finding[]
}

export default function ScanChat({ scan, findings }: ScanChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your HeimdallAI Security Assistant. I can help you understand the scan results for **${scan.name}**.\n\nI can explain:\n• Vulnerabilities and their severity\n• Technical details and evidence\n• Remediation recommendations\n• Risk prioritization\n• Explainable AI analysis (SHAP, LIME, etc.)\n\nWhat would you like to know about this scan?`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Call chat API with scan context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          context: {
            type: 'scan',
            scan_id: scan.id,
            scan_name: scan.name,
            target: scan.target,
            scan_types: scan.scan_types,
            status: scan.status,
            findings_count: findings.length,
            findings_summary: {
              critical: findings.filter(f => f.severity === 'critical').length,
              high: findings.filter(f => f.severity === 'high').length,
              medium: findings.filter(f => f.severity === 'medium').length,
              low: findings.filter(f => f.severity === 'low').length,
            },
            top_findings: findings.slice(0, 5).map(f => ({
              title: f.title,
              severity: f.severity,
              description: f.description,
              affected_asset: f.affected_asset
            }))
          },
          mode: 'scan_assistant'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageCircle className="h-5 w-5 text-blue-400" />
          AI Assistant
          <Badge className="ml-auto bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/50">
            <Sparkles className="h-3 w-3 mr-1" />
            XAI Enabled
          </Badge>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Ask questions about scan results and get explainable AI insights
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar max-h-[400px]">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/50 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/20 border border-blue-500/50 text-blue-100'
                    : 'bg-gray-800/60 border border-gray-700/50 text-gray-200'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50 flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-400" />
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/50 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-400 animate-pulse" />
                </div>
              </div>
              <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about findings, severity, remediation..."
            disabled={loading}
            className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-blue-500/50"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInput('Explain the top 3 critical findings')}
            className="text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Top Critical
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInput('What should I fix first?')}
            className="text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <Shield className="h-3 w-3 mr-1" />
            Priorities
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInput('Show me SHAP analysis for the highest severity finding')}
            className="text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            XAI Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
