"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Shield, Globe, Code, Cloud, Wifi, FileText, Network, Loader2 } from "lucide-react"
import Link from "next/link"

const SCAN_TYPES = [
  { id: 'network', name: 'Network Penetration', icon: Network, desc: 'Port scanning, service detection, network vulnerabilities', color: 'text-blue-500' },
  { id: 'webapp', name: 'Web Application', icon: Globe, desc: 'OWASP Top 10, authentication, business logic flaws', color: 'text-purple-500' },
  { id: 'api', name: 'API Security', icon: Code, desc: 'REST, GraphQL, authentication, authorization testing', color: 'text-green-500' },
  { id: 'cloud', name: 'Cloud Security', icon: Cloud, desc: 'AWS, Azure, GCP configuration and IAM review', color: 'text-cyan-500' },
  { id: 'iot', name: 'IoT Security', icon: Wifi, desc: 'Firmware analysis, protocol testing, device hardening', color: 'text-orange-500' },
  { id: 'config', name: 'Config Review', icon: FileText, desc: 'Dependency scanning, IaC security, baseline compliance', color: 'text-yellow-500' },
]

export default function NewScanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    scan_types: [] as string[],
    natural_language: ''
  })

  const toggleScanType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      scan_types: prev.scan_types.includes(type)
        ? prev.scan_types.filter(t => t !== type)
        : [...prev.scan_types, type]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name || !formData.target) {
      setError('Please provide a scan name and target')
      return
    }

    if (formData.scan_types.length === 0) {
      setError('Please select at least one scan type')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create scan')
      }

      // Redirect to scan detail page
      router.push(`/dashboard/scans/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

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
            <Link href="/dashboard/findings" className="text-gray-300 hover:text-white transition">
              Findings
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">New Security Scan</h1>
          <p className="text-gray-400">Configure your AI-powered security assessment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Name your scan and specify the target</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Scan Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Production Web App Scan"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="target">Target (URL or IP)</Label>
                <Input
                  id="target"
                  placeholder="e.g., https://example.com or 192.168.1.1"
                  value={formData.target}
                  onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </CardContent>
          </Card>

          {/* Scan Types */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Scan Types</CardTitle>
              <CardDescription>Select the types of security tests to perform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {SCAN_TYPES.map((type) => {
                  const Icon = type.icon
                  const isSelected = formData.scan_types.includes(type.id)
                  return (
                    <div
                      key={type.id}
                      onClick={() => toggleScanType(type.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-6 w-6 ${type.color} mt-1`} />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{type.name}</h3>
                          <p className="text-sm text-gray-400">{type.desc}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {formData.scan_types.length > 0 && (
                <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="text-sm text-gray-400">Selected:</span>
                  {formData.scan_types.map(typeId => {
                    const type = SCAN_TYPES.find(t => t.id === typeId)
                    return type ? (
                      <Badge key={typeId} variant="outline">
                        {type.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Natural Language (Optional) */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Natural Language Instructions (Optional)</CardTitle>
              <CardDescription>
                Describe what you want to test in plain English. AI will understand and configure the scan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g., 'Look for SQL injection on the login page and check if admin endpoints are exposed'"
                value={formData.natural_language}
                onChange={(e) => setFormData(prev => ({ ...prev, natural_language: e.target.value }))}
                className="bg-gray-800 border-gray-700"
              />
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" size="lg" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Scan...
                </>
              ) : (
                'Start Scan'
              )}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline" size="lg" disabled={loading}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
