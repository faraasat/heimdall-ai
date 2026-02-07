import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, TrendingUp, Activity, Zap, Plus } from "lucide-react"
import Link from "next/link"
import FindingsList from "@/components/findings/FindingsList"

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

        {/* Findings List with Filters */}
        <FindingsList initialFindings={findings || []} />
      </div>
    </div>
  )
}

function getSeverityBadge(severity: string) {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-300 border-red-500/50',
    high: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    low: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    info: 'bg-gray-500/20 text-gray-300 border-gray-500/50'
  }

  return (
    <Badge className={`${colors[severity] || colors.info} border text-xs uppercase font-semibold`}>
      {severity}
    </Badge>
  )
}