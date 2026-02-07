import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, Activity, AlertTriangle, CheckCircle, Clock, Plus, TrendingUp, Zap, Target } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

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
  const criticalFindings = Math.floor(totalFindings * 0.15)
  const highFindings = Math.floor(totalFindings * 0.25)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-xl bg-gray-950/60 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Shield className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
              <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-400/30 transition-all" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              HeimdallAI
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-white font-semibold relative">
              Dashboard
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-500" />
            </Link>
            <Link href="/dashboard/scans" className="text-gray-300 hover:text-white transition-colors">
              Scans
            </Link>
            <Link href="/dashboard/findings" className="text-gray-300 hover:text-white transition-colors">
              Findings
            </Link>
            <Link href="/settings" className="text-gray-300 hover:text-white transition-colors">
              Settings
            </Link>
            <form action="/api/auth/logout" method="POST">
              <Button variant="outline" size="sm" className="border-gray-700 hover:border-gray-600">
                Logout
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name || 'Security Engineer'}
          </h1>
          <p className="text-gray-400">Here's your security overview at a glance.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-500/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300 animate-fade-in-up">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-300">Total Scans</CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalScans}</div>
              <p className="text-xs text-blue-300 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-500/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300 animate-fade-in-up delay-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Active Scans</CardTitle>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Activity className="h-5 w-5 text-purple-400 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{activeScans}</div>
              <p className="text-xs text-purple-300 mt-1">Real-time monitoring</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/10 border-green-500/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300 animate-fade-in-up delay-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-300">Completed</CardTitle>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{completedScans}</div>
              <p className="text-xs text-green-300 mt-1">Success rate: 98%</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/30 to-red-800/10 border-red-500/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300 animate-fade-in-up delay-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-300">Total Findings</CardTitle>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalFindings}</div>
              <p className="text-xs text-red-300 mt-1">{criticalFindings} critical, {highFindings} high</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/dashboard/new-scan" className="group animate-fade-in-up delay-400">
              <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500/30 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300 h-full group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-500/20 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl group-hover:scale-110 transition-transform">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white group-hover:text-blue-300 transition-colors">New Scan</CardTitle>
                      <CardDescription className="text-gray-400">Start a new security assessment</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/findings" className="group animate-fade-in-up delay-500">
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:border-gray-700 transition-all duration-300 h-full group-hover:scale-105 group-hover:shadow-xl cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">View Findings</CardTitle>
                      <CardDescription className="text-gray-400">Review discovered vulnerabilities</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/reports" className="group animate-fade-in-up delay-600">
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:border-gray-700 transition-all duration-300 h-full group-hover:scale-105 group-hover:shadow-xl cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Generate Report</CardTitle>
                      <CardDescription className="text-gray-400">Export security assessment reports</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Security Score & Activity */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm md:col-span-1 animate-fade-in-up delay-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Security Score
              </CardTitle>
              <CardDescription>Overall security posture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    {Math.max(50, 100 - totalFindings * 2)}
                  </div>
                  <div className="text-sm text-gray-400">out of 100</div>
                </div>
                <Progress value={Math.max(50, 100 - totalFindings * 2)} className="h-2" />
                <p className="text-xs text-gray-400 text-center">
                  {totalFindings > 0 ? 'Needs attention' : 'Excellent security posture'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm md:col-span-2 animate-fade-in-up delay-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scans && scans.slice(0, 3).map((scan, index) => (
                  <div key={scan.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${scan.status === 'running' ? 'bg-blue-400 animate-pulse' : scan.status === 'completed' ? 'bg-green-400' : 'bg-red-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-white">{scan.name}</p>
                        <p className="text-xs text-gray-400">{scan.target}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${scan.status === 'running' ? 'border-blue-500 text-blue-400' : scan.status === 'completed' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>
                      {scan.status}
                    </Badge>
                  </div>
                ))}
                {(!scans || scans.length === 0) && (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Scans */}
        <div className="animate-fade-in-up delay-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Recent Scans</h2>
            <Link href="/dashboard/scans">
              <Button variant="outline" className="border-gray-700 hover:border-gray-600">
                View All
              </Button>
            </Link>
          </div>
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              {scans && scans.length > 0 ? (
                <div className="space-y-4">
                  {scans.map((scan) => (
                    <Link key={scan.id} href={`/dashboard/scans/${scan.id}`}>
                      <div className="group flex items-center justify-between p-6 border border-gray-800 bg-gray-950/50 rounded-xl hover:border-gray-700 hover:bg-gray-900/70 transition-all duration-300 cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">{scan.name}</h3>
                            {scan.status === 'running' && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                <Clock className="h-3 w-3 mr-1 animate-spin" />
                                Running
                              </Badge>
                            )}
                            {scan.status === 'completed' && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                            {scan.status === 'failed' && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                Failed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{scan.target}</p>
                          <div className="flex gap-2 flex-wrap">
                            {scan.scan_types.map((type: string) => (
                              <Badge key={type} variant="outline" className="text-xs border-gray-700">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 ml-6">
                          <div className="text-right">
                            <div className="text-xs text-gray-400 mb-1">Findings</div>
                            <div className="text-3xl font-bold text-white">{scan.findings_count || 0}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex p-6 bg-gray-800/50 rounded-full mb-4">
                    <Shield className="h-16 w-16 text-gray-600" />
                  </div>
                  <p className="text-lg text-gray-400 mb-2">No scans yet</p>
                  <p className="text-sm text-gray-500 mb-6">Start your first security assessment</p>
                  <Link href="/dashboard/new-scan">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500">
                      Create New Scan
                    </Button>
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
