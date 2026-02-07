import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, Info } from "lucide-react"
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
            <Link href="/dashboard/scans" className="text-gray-300 hover:text-white transition">
              Scans
            </Link>
            <Link href="/dashboard/findings" className="text-white font-semibold">
              Findings
            </Link>
            <Link href="/settings" className="text-gray-300 hover:text-white transition">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Security Findings</h1>
          <p className="text-gray-400">All discovered vulnerabilities across your scans</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{findings?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-red-900/20 border-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-300">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-900/20 border-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-300">High</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{highCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-900/20 border-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-300">Medium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{mediumCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-300">Low</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{lowCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Findings List */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>All Findings</CardTitle>
            <CardDescription>Click on any finding to view details and remediation steps</CardDescription>
          </CardHeader>
          <CardContent>
            {findings && findings.length > 0 ? (
              <div className="space-y-3">
                {findings.map((finding: any) => (
                  <Link key={finding.id} href={`/dashboard/findings/${finding.id}`}>
                    <div className="p-4 border border-gray-800 rounded-lg hover:border-gray-700 transition cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
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
                            {finding.ai_confidence && (
                              <Badge variant="outline" className="text-xs">
                                {Math.round(finding.ai_confidence * 100)}% confidence
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{finding.description}</p>
                          {finding.scan && (
                            <div className="flex gap-4 text-xs text-gray-500">
                              <span>Scan: {finding.scan.name}</span>
                              <span>Target: {finding.scan.target}</span>
                            </div>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            finding.state === 'open' ? 'border-yellow-500 text-yellow-400' :
                            finding.state === 'remediated' ? 'border-green-500 text-green-400' :
                            'border-gray-500 text-gray-400'
                          }
                        >
                          {finding.state}
                        </Badge>
                      </div>
                      {finding.location && (
                        <p className="text-xs text-gray-500">Location: {finding.location}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No findings yet</p>
                <p className="text-sm mb-4">Run a security scan to discover vulnerabilities</p>
                <Link href="/dashboard/new-scan">
                  <Button>Create New Scan</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
