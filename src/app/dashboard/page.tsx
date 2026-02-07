import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Activity, AlertTriangle, CheckCircle, Clock, Plus } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch user's scans
  const { data: scans } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate statistics
  const totalScans = scans?.length || 0
  const activeScans = scans?.filter(s => s.status === 'running').length || 0
  const completedScans = scans?.filter(s => s.status === 'completed').length || 0
  const totalFindings = scans?.reduce((sum, scan) => sum + (scan.findings_count || 0), 0) || 0

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
            <Link href="/dashboard" className="text-white font-semibold">
              Dashboard
            </Link>
            <Link href="/dashboard/scans" className="text-gray-300 hover:text-white transition">
              Scans
            </Link>
            <Link href="/dashboard/findings" className="text-gray-300 hover:text-white transition">
              Findings
            </Link>
            <Link href="/settings" className="text-gray-300 hover:text-white transition">
              Settings
            </Link>
            <form action="/api/auth/logout" method="POST">
              <Button variant="outline" size="sm">Logout</Button>
            </form>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Scans</CardTitle>
              <Shield className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScans}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Scans</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{activeScans}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{completedScans}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Findings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{totalFindings}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/dashboard/new-scan">
              <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-0 hover:shadow-lg transition cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    New Scan
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Start a new security assessment
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/findings">
              <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    View Findings
                  </CardTitle>
                  <CardDescription>
                    Review discovered vulnerabilities
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/reports">
              <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Generate Report
                  </CardTitle>
                  <CardDescription>
                    Export security assessment reports
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Scans */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Scans</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>Your latest security assessments</CardDescription>
            </CardHeader>
            <CardContent>
              {scans && scans.length > 0 ? (
                <div className="space-y-4">
                  {scans.map((scan) => (
                    <Link key={scan.id} href={`/dashboard/scans/${scan.id}`}>
                      <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg hover:border-gray-700 transition cursor-pointer">
                        <div className="flex-1">
                          <h3 className="font-semibold">{scan.name}</h3>
                          <p className="text-sm text-gray-400">{scan.target}</p>
                          <div className="flex gap-2 mt-2">
                            {scan.scan_types.map((type: string) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Findings</div>
                            <div className="text-2xl font-bold">{scan.findings_count || 0}</div>
                          </div>
                          <div>
                            {scan.status === 'running' && (
                              <Badge className="bg-blue-500">
                                <Clock className="h-3 w-3 mr-1" />
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
                              <Badge className="bg-red-500">
                                Failed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No scans yet</p>
                  <p className="text-sm mb-4">Start your first security assessment</p>
                  <Link href="/dashboard/new-scan">
                    <Button>Create New Scan</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
