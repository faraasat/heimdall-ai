"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft, Code, FileText, Lightbulb, AlertTriangle, CheckCircle, Brain, Target, TrendingUp, Zap, Book, Download, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface FindingDetailProps {
  finding: any
}

export default function FindingDetailClient({ finding }: FindingDetailProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const updateState = async (newState: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/findings/${finding.id}/state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState })
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update finding state:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "from-red-500/30 to-red-600/20 text-red-200 border-red-500/50",
      high: "from-orange-500/30 to-orange-600/20 text-orange-200 border-orange-500/50",
      medium: "from-yellow-500/30 to-yellow-600/20 text-yellow-200 border-yellow-500/50",
      low: "from-blue-500/30 to-blue-600/20 text-blue-200 border-blue-500/50",
      info: "from-gray-500/30 to-gray-600/20 text-gray-200 border-gray-500/50"
    }
    return colors[severity] || colors.info
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 top-1/3 -right-48 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link href="/dashboard/findings">
          <Button variant="outline" className="mb-6 border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Findings
          </Button>
        </Link>

        {/* Finding Header */}
        <div className="backdrop-blur-sm bg-gray-900/30 rounded-lg p-6 border border-gray-800/50 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-3">
                {finding.title}
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed">{finding.description}</p>
            </div>
            <Badge className={`ml-4 bg-gradient-to-r ${getSeverityColor(finding.severity)} border text-lg px-4 py-2`}>
              {finding.severity.toUpperCase()}
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Scan</p>
              <Link href={`/dashboard/scans/${finding.scan.id}`} className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                {finding.scan.name}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Target</p>
              <p className="text-white font-medium">{finding.scan.target}</p>
            </div>
            <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Discovered By</p>
              <p className="text-white font-medium">{finding.discovered_by_agent || 'AI Agent'}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* XAI Explainable AI Analysis */}
            {finding.ai_reasoning && (
              <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="h-5 w-5 text-purple-400" />
                    🧠 Explainable AI Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    How our AI identified and reasoned about this vulnerability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {finding.ai_reasoning.reasoning_chain && finding.ai_reasoning.reasoning_chain.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-purple-300 uppercase mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Reasoning Chain
                      </h3>
                      <div className="space-y-2">
                        {finding.ai_reasoning.reasoning_chain.map((step: string, index: number) => (
                          <div key={index} className="flex gap-3 items-start">
                            <div className="bg-purple-500/20 text-purple-300 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-gray-200 flex-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {finding.ai_reasoning.confidence_score && (
                    <div>
                      <h3 className="font-semibold text-sm text-purple-300 uppercase mb-2">Confidence Score</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${Math.round(finding.ai_reasoning.confidence_score * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-bold text-lg">
                          {Math.round(finding.ai_reasoning.confidence_score * 100)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {finding.ai_reasoning.alternative_hypotheses && finding.ai_reasoning.alternative_hypotheses.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-purple-300 uppercase mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Alternative Hypotheses Considered
                      </h3>
                      <ul className="space-y-1">
                        {finding.ai_reasoning.alternative_hypotheses.map((hypothesis: string, index: number) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span>
                            <span>{hypothesis}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Technical Details */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Code className="h-5 w-5 text-blue-400" />
                  Technical Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {finding.affected_asset && (
                    <div>
                      <h3 className="font-semibold text-xs text-gray-400 uppercase mb-1">Affected Asset</h3>
                      <p className="text-white font-mono text-sm bg-gray-800/50 p-2 rounded border border-gray-700/50">
                        {finding.affected_asset}
                      </p>
                    </div>
                  )}
                  
                  {finding.cvss_score && (
                    <div>
                      <h3 className="font-semibold text-xs text-gray-400 uppercase mb-1">CVSS Score</h3>
                      <p className="text-2xl font-bold text-white">{finding.cvss_score}</p>
                    </div>
                  )}
                  
                  {finding.cwe_id && (
                    <div>
                      <h3 className="font-semibold text-xs text-gray-400 uppercase mb-1">CWE ID</h3>
                      <a 
                        href={`https://cwe.mitre.org/data/definitions/${finding.cwe_id}.html`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                      >
                        CWE-{finding.cwe_id}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-xs text-gray-400 uppercase mb-1">Discovery Time</h3>
                    <p className="text-white text-sm">
                      {new Date(finding.discovered_at || finding.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence */}
            {finding.evidence && Object.keys(finding.evidence).length > 0 && (
              <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="h-5 w-5 text-green-400" />
                    Evidence
                  </CardTitle>
                  <CardDescription className="text-gray-400\">
                    Supporting data captured during vulnerability detection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto text-sm border border-gray-800 max-h-96">
                    <code className="text-green-400">{JSON.stringify(finding.evidence, null, 2)}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Remediation Steps */}
            {finding.remediation && Object.keys(finding.remediation).length > 0 && (
              <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-300">
                    <Shield className="h-5 w-5" />
                    🛡️ Remediation Guidance
                  </CardTitle>
                  <CardDescription className="text-green-200/70">
                    Follow these steps to fix this vulnerability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {finding.remediation.steps && finding.remediation.steps.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-green-300 uppercase mb-3">Remediation Steps</h3>
                      <ol className="space-y-3">
                        {finding.remediation.steps.map((step: string, index: number) => (
                          <li key={index} className="flex gap-3 items-start">
                            <div className="bg-green-500/20 text-green-300 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-gray-200 flex-1">{step}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {finding.remediation.code_examples && finding.remediation.code_examples.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-green-300 uppercase mb-2 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Code Examples
                      </h3>
                      {finding.remediation.code_examples.map((example: string, index: number) => (
                        <pre key={index} className="bg-gray-950 p-4 rounded-lg overflow-x-auto text-sm border border-green-500/30 mt-2">
                          <code className="text-green-300">{example}</code>
                        </pre>
                      ))}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {finding.remediation.estimated_effort && (
                      <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                        <p className="text-xs text-green-300 uppercase font-semibold mb-1">Estimated Effort</p>
                        <p className="text-white font-medium">{finding.remediation.estimated_effort}</p>
                      </div>
                    )}
                    {finding.remediation.priority && (
                      <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                        <p className="text-xs text-green-300 uppercase font-semibold mb-1">Priority</p>
                        <Badge className="bg-green-500/20 text-green-200 border-green-500/50">
                          {finding.remediation.priority.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                  onClick={() => updateState('remediated')}
                  disabled={isUpdating || finding.state === 'remediated'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Remediated
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => updateState('false_positive')}
                  disabled={isUpdating || finding.state === 'false_positive'}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Mark as False Positive
                </Button>

                <Button 
                  variant="outline"
                  className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => updateState('accepted_risk')}
                  disabled={isUpdating || finding.state === 'accepted_risk'}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Accept Risk
                </Button>

                <Button 
                  variant="outline"
                  className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </CardContent>
            </Card>

            {/* References */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Book className="h-5 w-5 text-blue-400" />
                  References
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {finding.cwe_id && (
                  <a
                    href={`https://cwe.mitre.org/data/definitions/${finding.cwe_id}.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <ExternalLink className="h-3 w-3" />
                    CWE-{finding.cwe_id} Details
                  </a>
                )}
                <a
                  href="https://owasp.org/Top10/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  <ExternalLink className="h-3 w-3" />
                  OWASP Top 10
                </a>
                <a
                  href="https://nvd.nist.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  <ExternalLink className="h-3 w-3" />
                  NIST NVD
                </a>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 rounded-full p-2">
                    <Zap className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Discovered</p>
                    <p className="text-white text-sm">{new Date(finding.discovered_at || finding.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-500/20 rounded-full p-2">
                    <Brain className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Last Updated</p>
                    <p className="text-white text-sm">{new Date(finding.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
