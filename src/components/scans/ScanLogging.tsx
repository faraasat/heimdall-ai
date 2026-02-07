"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertTriangle, Info, Zap, Target, Brain, Activity } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'success' | 'warning' | 'error'
  agent?: string
  phase?: string
  message: string
  target?: string
  technique?: string
  progress?: number
}

interface ScanLoggingProps {
  scanId: string
  isActive?: boolean
  onComplete?: () => void
}

export default function ScanLogging({ scanId, isActive = true, onComplete }: ScanLoggingProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentPhase, setCurrentPhase] = useState<string>("Initializing")
  const [currentAgent, setCurrentAgent] = useState<string>("")
  const [progress, setProgress] = useState<number>(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!isActive || !scanId) return

    // Connect to SSE endpoint for real-time logging
    const eventSource = new EventSource(`/api/scans/${scanId}/stream`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // Update current phase and progress
        if (data.scan) {
          setCurrentPhase(data.scan.status || 'running')
          setProgress(data.progress || 0)
        }

        // Process new log entries
        if (data.logs && data.logs.length > 0) {
          const newLogs: LogEntry[] = data.logs.map((log: any) => ({
            id: log.id || `${Date.now()}-${Math.random()}`,
            timestamp: new Date(log.created_at),
            level: log.level || 'info',
            agent: log.agent_name,
            phase: log.phase,
            message: log.message,
            target: log.target,
            technique: log.technique,
            progress: log.progress
          }))

          setLogs(prev => [...prev, ...newLogs].slice(-100)) // Keep last 100 logs

          // Update current agent from latest log
          const latestLog = newLogs[newLogs.length - 1]
          if (latestLog.agent) {
            setCurrentAgent(latestLog.agent)
          }
        }

        // Handle completion
        if (data.scan?.status === 'completed' || data.scan?.status === 'failed') {
          eventSource.close()
          if (onComplete) {
            onComplete()
          }
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [scanId, isActive, onComplete])

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      default:
        return <Info className="h-4 w-4 text-blue-400" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-blue-400'
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Status Header */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Activity className="h-6 w-6 text-purple-400 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Current Phase</p>
                  <p className="text-white font-bold text-lg capitalize">{currentPhase}</p>
                </div>
              </div>
              {currentAgent && (
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Active Agent</p>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 mt-1">
                    <Brain className="h-3 w-3 mr-1" />
                    {currentAgent}
                  </Badge>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase font-semibold">Overall Progress</p>
                <p className="text-white font-bold">{Math.round(progress)}%</p>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Stream */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            🔥 Live Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={scrollRef}
            className="h-96 overflow-y-auto space-y-2 bg-gray-950/50 rounded-lg p-4 border border-gray-800"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(75 85 99) rgb(17 24 39)'
            }}
          >
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Waiting for scan activity...</p>
                </div>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-colors"
                >
                  <div className="mt-0.5">{getLevelIcon(log.level)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 font-mono">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      {log.phase && (
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                          {log.phase}
                        </Badge>
                      )}
                      {log.agent && (
                        <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/50">
                          {log.agent}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${getLevelColor(log.level)} break-words`}>
                      {log.message}
                    </p>
                    {(log.target || log.technique) && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        {log.target && (
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {log.target}
                          </span>
                        )}
                        {log.technique && (
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {log.technique}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
