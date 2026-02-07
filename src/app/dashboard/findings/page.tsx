import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, TrendingUp, Activity, Zap, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"

export default async function FindingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch all findings from user's scans
  const { data: findings } = await supabase
    .from('findings')
    .select(`
      *,
      scan:scans(id, name, target)
    `)
    .eq('scans.user_id', user.id)
    .order('created_at', { ascending: false })

  const criticalCount = findings?.filter(f => f.severity === 'critical').length || 0
  const highCount = findings?.filter(f => f.severity === 'high').length || 0
  const mediumCount = findings?.filter(f => f.severity === 'medium').length || 0
  const lowCount = findings?.filter(f => f.severity === 'low').length || 0

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

  const getStateBadge = (state: string) => {
    const colors: Record<string, string> = {
      new: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
      confirmed: "bg-orange-500/20 text-orange-300 border-orange-500/50",
      false_positive: "bg-gray-500/20 text-gray-300 border-gray-500/50",
      remediated: "bg-green-500/20 text-green-300 border-green-500/50",
      accepted_risk: "bg-blue-500/20 text-blue-300 border-blue-500/50"
    }

    return (
      <Badge className={`${colors[state] || colors.new} border px-2 py-0.5 text-xs`}>
        {state.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 top-1/3 -right-48 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-96 h-96 bottom-0 left-1/2 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="backdrop-blur-sm bg-gray-900/30 rounded-lg p-6 border border-gray-800/50 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
                Security Findings
              </h1>
              <p className="text-gray-400">All discovered vulnerabilities across your scans</p>
            </div>
            <Link href="/dashboard/new-scan">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                <Plus className="h-4 w-4 mr-2" />
                New Scan
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm hover:scale-105 transition-transform">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{findings?.length || 0}</div>
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
              <div className="text-3xl font-bold text-red-400">{criticalCount}</div>
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
              <div className="text-3xl font-bold text-orange-400">{highCount}</div>
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
              <div className="text-3xl font-bold text-yellow-400">{mediumCount}</div>
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
              <div className="text-3xl font-bold text-blue-400">{lowCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Findings List */}
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              All Findings
            </CardTitle>
            <CardDescription className="text-gray-400">Click on any finding to view details and remediation steps</CardDescription>
          </CardHeader>
          <CardContent>
            {findings && findings.length > 0 ? (
              <div className="space-y-3">
                {findings.map((finding: any, index: number) => (
                  <Link key={finding.id} href={`/dashboard/findings/${finding.id}`}>
                    <div 
                      className="p-5 bg-gray-800/40 border border-gray-700/50 rounded-lg hover:border-red-500/50 hover:scale-[1.02] transition-all cursor-pointer"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-white text-lg">{finding.title}</h3>
                            {getSeverityBadge(finding.severity)}
                            {finding.ai_reasoning?.confidence_score && (
                              <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                                {Math.round(finding.ai_reasoning.confidence_score * 100)}% AI confidence
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 mb-3 leading-relaxed">{finding.description}</p>
                          {finding.scan && (
                            <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2">
                              <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                <span className="font-medium">Scan:</span> {finding.scan.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                <span className="font-medium">Target:</span> {finding.scan.target}
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                <span className="font-medium">Agent:</span> {finding.discovered_by_agent || 'Unknown'}
                              </span>
                            </div>
                          )}
                          {finding.affected_asset && (
                            <p className="text-xs text-gray-500 font-mono bg-gray-900/50 px-2 py-1 rounded border border-gray-700/30 inline-block">
                              📍 {finding.affected_asset}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStateBadge(finding.state || 'new')}
                          <ArrowRight className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full"></div>
                  <Shield className="absolute inset-0 m-auto h-10 w-10 text-green-400" />
                </div>
                <p className="text-xl font-semibold text-white mb-2">No findings yet</p>
                <p className="text-sm mb-6">Run a security scan to discover vulnerabilities in your applications</p>
                <Link href="/dashboard/new-scan">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Scan
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
