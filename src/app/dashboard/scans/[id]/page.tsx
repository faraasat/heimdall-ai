"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, Activity, AlertTriangle, CheckCircle, Clock, ArrowLeft, Download, Zap, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { Scan, Finding, AgentActivityLog } from "@/lib/types/database"

export default function ScanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const scanId = params.id as string
  const eventSourceRef = useRef<EventSource | null>(null)

  const [scan, setScan] = useState<Scan | null>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [logs, setLogs] = useState<AgentActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`/api/scans/${scanId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch scan data')
        }
        const data = await response.json()
        setScan(data.scan)
        setFindings(data.findings || [])
        setLogs(data.logs || [])
        setLoading(false)

        // Calculate initial progress
        if (data.scan.status === 'completed') {
          setProgress(100)
        } else if (data.scan.status === 'running') {
          setProgress(50)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setLoading(false)
      }
    }

    fetchInitialData()

    // Set up SSE connection for real-time updates
    const connectSSE = () => {
      const eventSource = new EventSource(`/api/scans/${scanId}/stream`)
      eventSourceRef.current = eventSource

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'scan') {
            setScan(data.data)
            
            // Update progress based on status
            if (data.data.status === 'completed') {
              setProgress(100)
            } else if (data.data.status === 'running') {
              setProgress((prev) => Math.min(prev + 5, 95))
            }
          } else if (data.type === 'logs') {
            setLogs(data.data)
          } else if (data.type === 'findings') {
            setFindings(data.data)
          } else if (data.type === 'done') {
            eventSource.close()
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err)
        }
      }

      eventSource.onerror = () => {
        eventSource.close()
        // Reconnect after 5 seconds if scan is still running
        if (scan?.status === 'running') {
          setTimeout(connectSSE, 5000)
        }
      }
    }

    connectSSE()

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [scanId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 top-1/2 right-0 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative flex items-center justify-center h-screen text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/20 border-t-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading scan data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative container mx-auto p-6">
          <Card className="bg-gradient-to-br from-red-900/30 to-red-800/10 border border-red-500/20 backdrop-blur-sm text-white">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error
              </CardTitle>
              <CardDescription className="text-red-300/70">{error || 'Scan not found'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const criticalFindings = findings.filter(f => f.severity === 'critical').length
  const highFindings = findings.filter(f => f.severity === 'high').length
  const mediumFindings = findings.filter(f => f.severity === 'medium').length
  const lowFindings = findings.filter(f => f.severity === 'low').length

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { colors: string, icon: any }> = {
      running: { colors: "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/50 animate-pulse", icon: Clock },
      completed: { colors: "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-green-500/50", icon: CheckCircle },
      failed: { colors: "bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border-red-500/50", icon: AlertTriangle },
      pending: { colors: "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-500/50", icon: Clock }
    }

    const config = variants[status] || variants.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.colors} flex items-center gap-1.5 px-3 py-1 border`}>
        <Icon className="h-3.5 w-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "bg-gradient-to-r from-red-500/30 to-red-600/20 text-red-200 border-red-500/50",
      high: "bg-gradient-to-r from-orange-500/30 to-orange-600/20 text-orange-200 border-orange-500/50",
      medium: "bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 text-yellow-200 border-yellow-500/50",
      low: "bg-gradient-to-r from-blue-500/30 to-blue-600/20 text-blue-200 border-blue-500/50",
      info: "bg-gradient-to-r from-gray-500/30 to-gray-600/20 text-gray-200 border-gray-500/50"
    }

    return (
      <Badge className={`${colors[severity] || colors.info} border px-3 py-1`}>
        {severity.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 top-1/3 -right-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-96 h-96 bottom-0 left-1/3 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="backdrop-blur-sm bg-gray-900/30 rounded-lg p-6 border border-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {scan.name}
                </h1>
                <p className="text-gray-400 mt-1">Target: <span className="text-blue-400">{scan.target}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(scan.status)}
              <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {scan.scan_types?.map((type: string) => (
              <Badge key={type} variant="outline" className="border-blue-500/30 text-blue-300">
                {type}
              </Badge>
            ))}
          </div>
          {scan.status === 'running' && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Scan Progress</span>
                <span className="text-sm text-blue-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm hover:scale-105 transition-transform">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{findings.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/30 to-red-800/10 border border-red-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Critical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{criticalFindings}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border border-orange-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-300 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                High
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">{highFindings}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border border-yellow-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-300 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Medium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{mediumFindings}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Low
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{lowFindings}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                <Download className="h-4 w-4 mr-1" />
                Report
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-blue-400" />
                Agent Activity
                {scan.status === 'running' && (
                  <Badge className="ml-auto animate-pulse bg-blue-500/20 text-blue-300 border-blue-500/50">
                    <Clock className="h-3 w-3 mr-1 animate-spin" />
                    Live
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-gray-400">Real-time feed from security testing agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div 
                      key={log.id} 
                      className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-lg hover:border-blue-500/50 transition-all"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                          {log.agent_type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{log.message}</p>
                      {log.details && (
                        <pre className="text-xs text-gray-500 mt-2 overflow-x-auto bg-gray-900/50 p-2 rounded border border-gray-700/30">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No activity logs yet</p>
                    {scan.status === 'running' && (
                      <p className="text-sm mt-2">Agents are initializing...</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Findings */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Findings
                <Badge className="ml-auto bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border-red-500/50">
                  {findings.length} Total
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">Discovered vulnerabilities and security issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {findings.length > 0 ? (
                  findings.map((finding, index) => (
                    <div 
                      key={finding.id} 
                      className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-lg hover:border-red-500/50 hover:scale-[1.02] transition-all"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white text-sm">{finding.title}</h3>
                        {getSeverityBadge(finding.severity)}
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{finding.description}</p>
                      {finding.affected_asset && (
                        <p className="text-xs text-gray-500 mb-3 font-mono bg-gray-900/50 px-2 py-1 rounded border border-gray-700/30">
                          📍 {finding.affected_asset}
                        </p>
                      )}
                      <Link href={`/dashboard/findings/${finding.id}`}>
                        <Button size="sm" variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                          View Details →
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    {scan.status === 'running' ? (
                      <>
                        <div className="relative mx-auto w-16 h-16 mb-4">
                          <div className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                          <Shield className="absolute inset-0 m-auto h-8 w-8 text-blue-400" />
                        </div>
                        <p className="font-medium">Scanning in progress...</p>
                        <p className="text-sm mt-2">Looking for vulnerabilities</p>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400 opacity-50" />
                        <p className="font-medium">No vulnerabilities found</p>
                        <p className="text-sm mt-2">Your application appears secure! 🎉</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
