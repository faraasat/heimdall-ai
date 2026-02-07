"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Globe, Shield, Zap, Cloud, Cpu, Settings, Check, Loader2, AlertTriangle, Wrench } from "lucide-react"
import Link from "next/link"
import type { ScanType } from "@/lib/types/database"
import { hasDangerousTools, getToolsForScanType } from "@/lib/tools/security-tools"

const scanTypes = [
  {
    id: 'network' as ScanType,
    name: 'Network Penetration',
    description: 'Comprehensive network infrastructure testing',
    icon: Shield,
    emoji: '🌐',
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-400/60',
    features: ['Port Scanning', 'Service Enumeration', 'Vulnerability Assessment', 'Network Mapping'],
    subtypes: ['External', 'Internal', 'Wireless'],
    comingSoon: false,
  },
  {
    id: 'webapp' as ScanType,
    name: 'Web Application',
    description: 'Test web applications for OWASP Top 10',
    icon: Globe,
    emoji: '🌐',
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-400/60',
    features: ['SQL Injection', 'XSS', 'CSRF', 'Authentication Bypass'],
    subtypes: ['Black Box', 'Grey Box', 'White Box'],
    comingSoon: false,
  },
  {
    id: 'api' as ScanType,
    name: 'API Security',
    description: 'Test APIs for auth, access control, and data exposure',
    icon: Cpu,
    emoji: '🔗',
    color: 'from-green-500 to-emerald-500',
    borderColor: 'border-green-500/30',
    hoverBorder: 'hover:border-green-400/60',
    features: ['Auth Checks', 'Broken Access Control', 'Rate Limits', 'Data Exposure'],
    subtypes: ['REST', 'GraphQL', 'gRPC'],
    comingSoon: false,
  },
  {
    id: 'mobile' as ScanType,
    name: 'Mobile Application',
    description: 'iOS/Android app security testing',
    icon: Cpu,
    emoji: '📱',
    color: 'from-indigo-500 to-violet-500',
    borderColor: 'border-indigo-500/30',
    hoverBorder: 'hover:border-indigo-400/60',
    features: ['Static Analysis', 'Dynamic Testing', 'API Security', 'Data Storage'],
    subtypes: ['iOS', 'Android', 'React Native', 'Flutter'],
    comingSoon: true,
  },
  {
    id: 'cloud' as ScanType,
    name: 'Cloud Security',
    description: 'AWS, Azure, GCP infrastructure audit',
    icon: Cloud,
    emoji: '☁️',
    color: 'from-yellow-500 to-orange-500',
    borderColor: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-400/60',
    features: ['IAM Review', 'Storage Security', 'Network Config', 'Compliance'],
    subtypes: ['AWS', 'Azure', 'GCP', 'Multi-Cloud'],
    comingSoon: false,
  },
  {
    id: 'iot' as ScanType,
    name: 'IoT Testing',
    description: 'Internet of Things and embedded devices',
    icon: Zap,
    emoji: '🔌',
    color: 'from-pink-500 to-rose-500',
    borderColor: 'border-pink-500/30',
    hoverBorder: 'hover:border-pink-400/60',
    features: ['Device Security', 'Protocol Analysis', 'Firmware Review', 'Hardware Hacking'],
    subtypes: ['Consumer', 'Industrial', 'Healthcare'],
    comingSoon: false,
  },
  {
    id: 'config' as ScanType,
    name: 'Configuration Review',
    description: 'Security configuration and compliance audit',
    icon: Settings,
    emoji: '⚙️',
    color: 'from-slate-500 to-gray-500',
    borderColor: 'border-slate-500/30',
    hoverBorder: 'hover:border-slate-400/60',
    features: ['Security Hardening', 'Best Practices', 'Compliance Check', 'Policy Review'],
    subtypes: ['Server', 'Database', 'Network', 'Application'],
    comingSoon: false,
  },
]

export default function NewScanPage() {
  const router = useRouter()
  const [selectedTypes, setSelectedTypes] = useState<ScanType[]>([])
  const [scanMode, setScanMode] = useState<'agentic' | 'manual'>('agentic')
  const [approach, setApproach] = useState<'blackbox' | 'greybox' | 'whitebox'>('blackbox')
  const [intensity, setIntensity] = useState<'light' | 'normal' | 'aggressive'>('normal')
  const [timeoutSeconds, setTimeoutSeconds] = useState<number>(900)
  const [scanName, setScanName] = useState("")
  const [target, setTarget] = useState("")
  const [naturalLanguage, setNaturalLanguage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enableDangerousTools, setEnableDangerousTools] = useState(false)
  const [greyBoxContext, setGreyBoxContext] = useState("")
  const [greyBoxUrls, setGreyBoxUrls] = useState("")
  const [whiteBoxContext, setWhiteBoxContext] = useState("")
  const [whiteBoxUrls, setWhiteBoxUrls] = useState("")

  const showDangerousToolsWarning = hasDangerousTools(selectedTypes)

  const toggleScanType = (typeId: ScanType) => {
    // Check if scan type is coming soon
    const scanType = scanTypes.find(t => t.id === typeId)
    if (scanType?.comingSoon) {
      return
    }
    
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!target || !scanName) {
      setError("Please fill in all required fields")
      return
    }

    if (selectedTypes.length === 0) {
      setError("Please select at least one scan type")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: scanName,
          target,
          scan_mode: scanMode,
          testing_approach: approach,
          intensity,
          timeout_seconds: timeoutSeconds,
          enable_dangerous_tools: enableDangerousTools,
          scan_types: selectedTypes,
          scan_type: selectedTypes[0], // For backward compatibility
          natural_language: naturalLanguage || undefined,
          grey_box_context: approach === 'greybox' ? greyBoxContext : undefined,
          grey_box_urls: approach === 'greybox' ? greyBoxUrls : undefined,
          white_box_context: approach === 'whitebox' ? whiteBoxContext : undefined,
          white_box_urls: approach === 'whitebox' ? whiteBoxUrls : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create scan')
      }

      const { scan } = await response.json()

      // Redirect to scan detail page
      router.push(`/dashboard/scans/${scan.id}`)
    } catch (error) {
      console.error('Error creating scan:', error)
      setError(error instanceof Error ? error.message : 'Failed to start scan. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 top-1/3 -right-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-96 h-96 bottom-0 left-1/2 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3 text-center">
            🚀 Launch Security Scan
          </h1>
          <p className="text-gray-400 text-center text-lg">Select testing types and choose between AI-driven or manual assessment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Scan Mode Selection */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                Scan Mode
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose how you want to conduct the security assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setScanMode('agentic')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    scanMode === 'agentic'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-4xl ${scanMode === 'agentic' ? 'animate-pulse' : ''}`}>🤖</div>
                    <div className="text-left flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Agentic Mode</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        AI agents autonomously execute tests, adapt to findings, and make intelligent decisions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">Autonomous</Badge>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">AI-Powered</Badge>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/50">Adaptive</Badge>
                      </div>
                    </div>
                    {scanMode === 'agentic' && (
                      <div className="text-green-400">
                        <Check className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScanMode('manual')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    scanMode === 'manual'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-4xl ${scanMode === 'manual' ? 'animate-pulse' : '' }`}>👤</div>
                    <div className="text-left flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Manual Mode</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        Guide the testing process step-by-step with full control over techniques and targets
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">User-Guided</Badge>
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">Methodical</Badge>
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50">Controlled</Badge>
                      </div>
                    </div>
                    {scanMode === 'manual' && (
                      <div className="text-green-400">
                        <Check className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* Testing Approach */}
              <div>
                <h3 className="text-white font-semibold mb-3">Testing Approach</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setApproach('blackbox')}
                    className={`p-4 rounded-lg border transition-all ${
                      approach === 'blackbox'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">⬛</div>
                      <p className="text-white font-medium">Black Box</p>
                      <p className="text-gray-400 text-xs mt-1">No prior knowledge</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApproach('greybox')}
                    className={`p-4 rounded-lg border transition-all ${
                      approach === 'greybox'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">⬜</div>
                      <p className="text-white font-medium">Grey Box</p>
                      <p className="text-gray-400 text-xs mt-1">Partial knowledge</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApproach('whitebox')}
                    className={`p-4 rounded-lg border transition-all ${
                      approach === 'whitebox'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">□</div>
                      <p className="text-white font-medium">White Box</p>
                      <p className="text-gray-400 text-xs mt-1">Full knowledge</p>
                    </div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scan Configuration */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Scan Configuration</CardTitle>
              <CardDescription className="text-gray-400">Basic information about your scan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="scanName" className="text-gray-300">Scan Name</Label>
                <Input
                  id="scanName"
                  placeholder="e.g., Production API Security Check"
                  value={scanName}
                  onChange={(e) => setScanName(e.target.value)}
                  className="mt-2 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="target" className="text-gray-300">Target URL/IP</Label>
                <Input
                  id="target"
                  placeholder="https://example.com or 192.168.1.1"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="mt-2 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter the target domain, URL, or IP address to scan</p>
              </div>

              {/* Grey Box Testing Context */}
              {approach === 'greybox' && (
                <div className="space-y-4 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-2xl">⬜</div>
                    <h3 className="text-white font-semibold">Grey Box Testing Context</h3>
                  </div>
                  <div>
                    <Label htmlFor="greyBoxContext" className="text-gray-300">Additional Context & Credentials</Label>
                    <textarea
                      id="greyBoxContext"
                      placeholder="Provide partial knowledge: authentication details, API keys, limited documentation, etc."
                      value={greyBoxContext}
                      onChange={(e) => setGreyBoxContext(e.target.value)}
                      className="mt-2 w-full min-h-[100px] rounded-md bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <p className="text-xs text-gray-400 mt-1">Example: Test user credentials, partial API documentation, known endpoints</p>
                  </div>
                  <div>
                    <Label htmlFor="greyBoxUrls" className="text-gray-300">Known URLs/Endpoints (one per line)</Label>
                    <textarea
                      id="greyBoxUrls"
                      placeholder="https://example.com/api/users&#10;https://example.com/admin&#10;https://example.com/api/v1/docs"
                      value={greyBoxUrls}
                      onChange={(e) => setGreyBoxUrls(e.target.value)}
                      className="mt-2 w-full min-h-[80px] rounded-md bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Provide known URLs, endpoints, or resources to target</p>
                  </div>
                </div>
              )}

              {/* White Box Testing Context */}
              {approach === 'whitebox' && (
                <div className="space-y-4 p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-2xl">□</div>
                    <h3 className="text-white font-semibold">White Box Testing Context</h3>
                  </div>
                  <div>
                    <Label htmlFor="whiteBoxContext" className="text-gray-300">Full Access Context & Documentation</Label>
                    <textarea
                      id="whiteBoxContext"
                      placeholder="Provide full knowledge: source code repository, architecture diagrams, database schemas, admin credentials, complete API documentation, etc."
                      value={whiteBoxContext}
                      onChange={(e) => setWhiteBoxContext(e.target.value)}
                      className="mt-2 w-full min-h-[120px] rounded-md bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                    <p className="text-xs text-gray-400 mt-1">Example: GitHub repo URLs, architecture docs, database credentials, complete API specs</p>
                  </div>
                  <div>
                    <Label htmlFor="whiteBoxUrls" className="text-gray-300">Documentation & Code Repository URLs (one per line)</Label>
                    <textarea
                      id="whiteBoxUrls"
                      placeholder="https://github.com/company/repo&#10;https://docs.example.com/internal-api&#10;https://wiki.example.com/architecture&#10;https://swagger.example.com/api-spec"
                      value={whiteBoxUrls}
                      onChange={(e) => setWhiteBoxUrls(e.target.value)}
                      className="mt-2 w-full min-h-[100px] rounded-md bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Provide repository URLs, documentation, specs, or any reference materials</p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="intensity" className="text-gray-300">Intensity</Label>
                  <select
                    id="intensity"
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as any)}
                    className="mt-2 w-full rounded-md bg-gray-800/50 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="normal">Normal</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timeout" className="text-gray-300">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min={60}
                    value={timeoutSeconds}
                    onChange={(e) => setTimeoutSeconds(Number(e.target.value || 0))}
                    className="mt-2 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Stops the scan after this time limit</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scan Type Selection */}
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">Select Scan Types</h2>
              <p className="text-gray-400">Choose one or more types of security assessments (select multiple for comprehensive testing)</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scanTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedTypes.includes(type.id)
                const isDisabled = type.comingSoon

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleScanType(type.id)}
                    disabled={isDisabled}
                    className={`text-left transition-all duration-300 relative ${
                      isDisabled ? 'opacity-60 cursor-not-allowed' : isSelected ? 'scale-105' : 'hover:scale-102'
                    }`}
                  >
                    <Card
                      className={`h-full bg-gradient-to-br from-gray-900/50 to-gray-800/30 border backdrop-blur-sm ${
                        isSelected
                          ? `${type.borderColor} border-2 shadow-lg`
                          : `border-gray-700/50 ${!isDisabled && type.hoverBorder}`
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-3 bg-gradient-to-br ${type.color} rounded-xl ${isDisabled && 'grayscale'}`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          {isSelected && !isDisabled && (
                            <div className="p-1 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                          {isDisabled && (
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 text-xs">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-white text-lg">{type.name}</CardTitle>
                        <CardDescription className="text-gray-400 text-sm">{type.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-400 uppercase">Key Features:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {type.features.map((feature) => (
                              <Badge
                                key={feature}
                                variant="outline"
                                className="text-xs border-gray-600 text-gray-300"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Natural Language (Optional) */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-400" />
                Natural Language Instructions (Optional)
              </CardTitle>
              <CardDescription className="text-gray-400">
                Describe what you want to test in plain English. AI agents will understand and configure additional checks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g., 'Look for SQL injection on the login page and check if admin endpoints are exposed'"
                value={naturalLanguage}
                onChange={(e) => setNaturalLanguage(e.target.value)}
                className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500"
              />
            </CardContent>

          {/* Dangerous Tools Warning */}
          {showDangerousToolsWarning && (
            <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Safety Warning: High-Risk Tools Available
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Some tests may use tools that could cause service disruption or denial of service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold mb-2">⚠️ High-Risk Tools Include:</p>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li><strong>SQL Injection Testing</strong> - May disrupt database operations</li>
                      <li><strong>Load Testing</strong> - Can cause temporary service unavailability</li>
                      <li><strong>Fuzzing Tools</strong> - May trigger rate limiting or crashes</li>
                    </ul>
                    <p className="text-sm text-gray-400 mt-3">
                      By default, only safe reconnaissance tools will be used. Enable high-risk tools only if you have authorization.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <input
                    type="checkbox"
                    id="enableDangerousTools"
                    checked={enableDangerousTools}
                    onChange={(e) => setEnableDangerousTools(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-600 text-red-500 focus:ring-2 focus:ring-red-500/20"
                  />
                  <label htmlFor="enableDangerousTools" className="text-white cursor-pointer flex-1">
                    <span className="font-semibold">I understand the risks and have proper authorization</span>
                    <span className="block text-sm text-gray-400 mt-1">
                      Enable tools that may cause service disruption (SQL injection, load testing, aggressive fuzzing)
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}
          </Card>

          {/* Selected Scan Summary */}
          {selectedTypes.length > 0 && scanName && target && (
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-2 border-blue-500/30 backdrop-blur-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-400" />
                  Scan Summary
                </CardTitle>
                <CardDescription className="text-gray-400">Review your configuration before starting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Scan Name</p>
                    <p className="text-white">{scanName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Target</p>
                    <p className="text-white break-all">{target}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Selected Scan Types</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTypes.map((typeId) => {
                      const type = scanTypes.find(t => t.id === typeId)
                      return type ? (
                        <Badge key={typeId} className={`bg-gradient-to-r ${type.color} text-white border-0`}>
                          {type.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tools Preview */}
          {selectedTypes.length > 0 && (
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-400" />
                  Security Tools for Selected Scan Types
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {enableDangerousTools 
                    ? 'All available tools will be used, including high-risk tools'
                    : 'Only safe reconnaissance tools will be used (dangerous tools disabled)'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedTypes.map((scanType) => {
                    const safeTools = getToolsForScanType(scanType, true)
                    const dangerousTools = getToolsForScanType(scanType, false).filter(t => t.isDangerous)
                    const scanTypeName = scanTypes.find(t => t.id === scanType)?.name || scanType

                    return (
                      <div key={scanType} className="space-y-2">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                            {scanTypeName}
                          </Badge>
                          <span className="text-gray-400">
                            ({safeTools.length} safe tool{safeTools.length !== 1 ? 's' : ''}{dangerousTools.length > 0 && `, ${dangerousTools.length} high-risk`})
                          </span>
                        </h3>
                        
                        {/* Safe Tools */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {safeTools.map((tool) => (
                            <div
                              key={tool.package}
                              className="p-3 bg-gray-800/40 border border-gray-700/30 rounded-lg"
                            >
                              <div className="flex items-start gap-2">
                                <Shield className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{tool.name}</p>
                                  <p className="text-xs text-gray-400 line-clamp-1">{tool.description}</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {tool.features.slice(0, 3).map((feature) => (
                                      <Badge
                                        key={feature}
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0 h-4 border-gray-600 text-gray-400"
                                      >
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Dangerous Tools */}
                        {dangerousTools.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                              <h4 className="text-xs font-semibold text-red-300 uppercase">
                                High-Risk Tools {!enableDangerousTools && '(Disabled)'}
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {dangerousTools.map((tool) => (
                                <div
                                  key={tool.package}
                                  className={`p-3 border rounded-lg ${
                                    enableDangerousTools
                                      ? 'bg-red-900/20 border-red-500/30'
                                      : 'bg-gray-800/20 border-gray-700/30 opacity-50'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${
                                      enableDangerousTools ? 'text-red-400' : 'text-gray-500'
                                    }`} />
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium truncate ${
                                        enableDangerousTools ? 'text-white' : 'text-gray-400'
                                      }`}>{tool.name}</p>
                                      <p className="text-xs text-gray-400 line-clamp-1">{tool.riskDescription || tool.description}</p>
                                      {!enableDangerousTools && (
                                        <Badge className="mt-1 bg-gray-700/50 text-gray-400 border-gray-600 text-[10px]">
                                          Disabled
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Card className="bg-gradient-to-br from-red-900/30 to-red-800/10 border border-red-500/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-red-300">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard">
              <Button variant="outline" type="button" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={!selectedTypes.length || !target || !scanName || isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting Scan...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Start Security Scan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
