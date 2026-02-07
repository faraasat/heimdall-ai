import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft, Code, FileText, Lightbulb, AlertTriangle, CheckCircle, Brain, Target, TrendingUp, Zap, Book } from "lucide-react"
import Link from "next/link"
import FindingDetailClient from "@/components/findings/FindingDetailClient"

export default async function FindingDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch finding with scan details
  const { data: finding } = await supabase
    .from('findings')
    .select(`
      *,
      scan:scans(id, name, target, user_id)
    `)
    .eq('id', params.id)
    .single()

  if (!finding || finding.scan.user_id !== user.id) {
    notFound()
  }

  return (
    <FindingDetailClient finding={finding} />
  )
}

// Legacy server component rendering kept for reference
function LegacyFindingDetail({ finding }: any) {
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
            <Link href="/dashboard/findings" className="text-white font-semibold">
              Findings
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Link href="/dashboard/findings">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Findings
          </Button>
        </Link>

        {/* Finding Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{finding.title}</h1>
              <p className="text-gray-400">{finding.description}</p>
            </div>
            <Badge
              variant="outline"
              className={`text-lg px-4 py-2 ${
                finding.severity === 'critical' ? 'border-red-500 text-red-400' :
                finding.severity === 'high' ? 'border-orange-500 text-orange-400' :
                finding.severity === 'medium' ? 'border-yellow-500 text-yellow-400' :
                'border-blue-500 text-blue-400'
              }`}
            >
              {finding.severity}
            </Badge>
          </div>

          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-gray-500">Scan:</span>{' '}
              <Link href={`/dashboard/scans/${finding.scan.id}`} className="text-blue-400 hover:underline">
                {finding.scan.name}
              </Link>
            </div>
            <div>
              <span className="text-gray-500">Target:</span> {finding.scan.target}
            </div>
            {finding.affected_asset && (
              <div>
                <span className="text-gray-500">Location:</span> {finding.affected_asset}
              </div>
            )}
          </div>

          {finding.ai_confidence && (
            <div className="mt-2">
              <Badge variant="outline">
                AI Confidence: {Math.round(finding.ai_confidence * 100)}%
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Technical Details */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {finding.cwe_id && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-400 mb-1">CWE ID</h3>
                  <a 
                    href={`https://cwe.mitre.org/data/definitions/${finding.cwe_id}.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    CWE-{finding.cwe_id}
                  </a>
                </div>
              )}

              {finding.cvss_score && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-400 mb-1">CVSS Score</h3>
                  <p className="text-lg font-bold">{finding.cvss_score}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-sm text-gray-400 mb-1">Category</h3>
                <Badge variant="outline">{finding.category}</Badge>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-400 mb-1">Status</h3>
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
            </CardContent>
          </Card>

          {/* Evidence */}
          {finding.evidence && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Evidence
                </CardTitle>
                <CardDescription>Supporting data for this finding</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto text-sm border border-gray-800">
                  <code>{JSON.stringify(finding.evidence, null, 2)}</code>
                </pre>
              </CardContent>
            </Card>
          )}

          {/* AI Reasoning */}
          {finding.ai_reasoning && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  AI Analysis & Reasoning
                </CardTitle>
                <CardDescription>How AI determined this vulnerability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap">{finding.ai_reasoning}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Remediation */}
          {finding.remediation && (
            <Card className="bg-green-900/10 border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Shield className="h-5 w-5" />
                  Remediation Steps
                </CardTitle>
                <CardDescription className="text-green-300">
                  Follow these steps to fix this vulnerability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap">{finding.remediation}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage this finding</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button variant="outline">Mark as Remediated</Button>
              <Button variant="outline">Mark as False Positive</Button>
              <Button variant="outline">Export Report</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
