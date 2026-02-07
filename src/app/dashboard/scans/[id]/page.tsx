"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Activity, AlertTriangle, Info, CheckCircle, Clock, ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import type { Scan, Finding, AgentActivityLog } from "@/lib/types/database"

export default function ScanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const scanId = params.id as string

  const [scan, setScan] = useState<Scan | null>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [logs, setLogs] = useState<AgentActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchScanData = async () => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScanData()

    // Poll for updates if scan is running
    const interval = setInterval(() => {
      if (scan?.status === 'running') {
        fetchScanData()
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [scanId, scan?.status])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading scan data...</p>
        </div>
      </div>
    )
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-xl mb-4">{error || 'Scan not found'}</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const criticalFindings = findings.filter(f => f.severity === 'critical').length
  const highFindings = findings.filter(f => f.severity === 'high').length
  const mediumFindings = findings.filter(f => f.severity === 'medium').length
  const lowFindings = findings.filter(f => f.severity === 'low').length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-sm bg-gray-950/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">HeimdallAI</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/dashboard/scans" className="text-white font-semibold">
              Scans
            </Link>
            <Link href="/dashboard/findings" className="text-gray-300 hover:text-white transition">
              Findings
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Scan Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">{scan.name}</h1>
            <div>
              {scan.status === 'running' && (
                <Badge className="bg-blue-500">
                  <Clock className="h-3 w-3 mr-1 animate-spin" />
                  Running
                </Badge>
              )}
              {scan.status === 'completed' && (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              {scan.status === 'failed' && (
                <Badge className="bg-red-500">Failed</Badge>
              )}
            </div>
          </div>
          <p className="text-gray-400">{scan.target}</p>
          <div className="flex gap-2 mt-2">
            {scan.scan_types.map((type: string) => (
              <Badge key={type} variant="outline">
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{findings.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-red-900/20 border-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-300">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{criticalFindings}</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-900/20 border-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-300">High</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{highFindings}</div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-900/20 border-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-300">Medium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{mediumFindings}</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-300">Low</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{lowFindings}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-1" />
                Report
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Activity Feed */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Agent Activity
              </CardTitle>
              <CardDescription>Live feed from security testing agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div key={log.id} className="p-3 border border-gray-800 rounded text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          {log.agent_type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{log.message}</p>
                      {log.details && (
                        <pre className="text-xs text-gray-500 mt-2 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No activity logs yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Findings */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Findings
              </CardTitle>
              <CardDescription>Discovered vulnerabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {findings.length > 0 ? (
                  findings.map((finding) => (
                    <div key={finding.id} className="p-4 border border-gray-800 rounded hover:border-gray-700 transition">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{finding.title}</h3>
                        <Badge
                          variant="outline"
                          className={
                            finding.severity === 'critical' ? 'border-red-500 text-red-400' :
                            finding.severity === 'high' ? 'border-orange-500 text-orange-400' :
                            finding.severity === 'medium' ? 'border-yellow-500 text-yellow-400' :
                            'border-blue-500 text-blue-400'
                          }
                        >
                          {finding.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{finding.description}</p>
                      {finding.location && (
                        <p className="text-xs text-gray-500">Location: {finding.location}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Link href={`/dashboard/findings/${finding.id}`}>
                          <Button size="sm" variant="outline">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    {scan.status === 'running' ? (
                      <>
                        <Clock className="h-12 w-12 mx-auto mb-2 animate-spin text-blue-500" />
                        <p>Scanning in progress...</p>
                      </>
                    ) : (
                      <p>No findings discovered</p>
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
