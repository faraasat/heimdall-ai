"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Globe, Shield, Zap, Cloud, Cpu, Settings, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import type { ScanType } from "@/lib/types/database"

const scanTypes = [
  {
    id: 'webapp' as ScanType,
    name: 'Web Application',
    description: 'Comprehensive web security testing including OWASP Top 10',
    icon: Globe,
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-400/60',
    features: ['SQL Injection', 'XSS', 'CSRF', 'Authentication'],
  },
  {
    id: 'api' as ScanType,
    name: 'API Security',
    description: 'REST & GraphQL API vulnerability assessment',
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-400/60',
    features: ['Authentication', 'Rate Limiting', 'Input Validation', 'Authorization'],
  },
  {
    id: 'network' as ScanType,
    name: 'Network Scan',
    description: 'Network infrastructure and port security analysis',
    icon: Shield,
    color: 'from-green-500 to-emerald-500',
    borderColor: 'border-green-500/30',
    hoverBorder: 'hover:border-green-400/60',
    features: ['Port Scanning', 'Service Detection', 'SSL/TLS', 'Firewall Rules'],
  },
  {
    id: 'cloud' as ScanType,
    name: 'Cloud Security',
    description: 'AWS, Azure, GCP configuration and compliance audit',
    icon: Cloud,
    color: 'from-orange-500 to-red-500',
    borderColor: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-400/60',
    features: ['IAM Policies', 'Storage Security', 'Network Config', 'Compliance'],
  },
  {
    id: 'iot' as ScanType,
    name: 'IoT Devices',
    description: 'Internet of Things device security assessment',
    icon: Cpu,
    color: 'from-yellow-500 to-orange-500',
    borderColor: 'border-yellow-500/30',
    hoverBorder: 'hover:border-yellow-400/60',
    features: ['Firmware Analysis', 'Protocol Testing', 'Device Auth', 'Communication'],
  },
  {
    id: 'config' as ScanType,
    name: 'Configuration',
    description: 'Infrastructure misconfigurations and hardening checks',
    icon: Settings,
    color: 'from-indigo-500 to-purple-500',
    borderColor: 'border-indigo-500/30',
    hoverBorder: 'hover:border-indigo-400/60',
    features: ['Best Practices', 'Security Headers', 'Hardening', 'Defaults'],
  },
]

export default function NewScanPage() {
  const router = useRouter()
  const [selectedTypes, setSelectedTypes] = useState<ScanType[]>([])
  const [scanName, setScanName] = useState("")
  const [target, setTarget] = useState("")
  const [naturalLanguage, setNaturalLanguage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleScanType = (typeId: ScanType) => {
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
          scan_types: selectedTypes,
          scan_type: selectedTypes[0], // For backward compatibility
          natural_language: naturalLanguage || undefined,
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            New Security Scan
          </h1>
          <p className="text-gray-400">Configure and launch your AI-powered security assessment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleScanType(type.id)}
                    className={`text-left transition-all duration-300 ${isSelected ? 'scale-105' : 'hover:scale-102'}`}
                  >
                    <Card
                      className={`h-full bg-gradient-to-br from-gray-900/50 to-gray-800/30 border backdrop-blur-sm ${
                        isSelected
                          ? `${type.borderColor} border-2 shadow-lg`
                          : `border-gray-700/50 ${type.hoverBorder}`
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-3 bg-gradient-to-br ${type.color} rounded-xl`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          {isSelected && (
                            <div className="p-1 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full">
                              <Check className="h-4 w-4 text-white" />
                            </div>
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

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
