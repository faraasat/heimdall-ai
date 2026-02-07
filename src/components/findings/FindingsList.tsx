"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, Activity, Zap, ArrowRight, Plus, Target, List, ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import FindingsFilters, { FilterState } from "@/components/findings/FindingsFilters"

interface Finding {
  id: string
  title: string
  description: string
  severity: string
  state: string
  affected_asset?: string
  discovered_by_agent?: string
  ai_reasoning?: { confidence_score?: number }
  scan?: { id: string; name: string; target: string }
}

interface FindingsListProps {
  initialFindings: Finding[]
}

export default function FindingsList({ initialFindings }: FindingsListProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    severities: [],
    states: []
  })
  const [groupByTarget, setGroupByTarget] = useState(true)
  const [expandedTargets, setExpandedTargets] = useState<Record<string, boolean>>({})

  const filteredFindings = useMemo(() => {
    return initialFindings.filter(finding => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          finding.title.toLowerCase().includes(searchLower) ||
          finding.description.toLowerCase().includes(searchLower) ||
          finding.affected_asset?.toLowerCase().includes(searchLower) ||
          finding.scan?.target.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }

      // Severity filter
      if (filters.severities.length > 0 && !filters.severities.includes(finding.severity as any)) {
        return false
      }

      // State filter
      if (filters.states.length > 0 && !filters.states.includes(finding.state as any)) {
        return false
      }

      return true
    })
  }, [initialFindings, filters])

  // Group findings by target
  const groupedFindings = useMemo(() => {
    const groups: Record<string, Finding[]> = {}
    filteredFindings.forEach(finding => {
      const target = finding.scan?.target || 'Unknown Target'
      if (!groups[target]) {
        groups[target] = []
      }
      groups[target].push(finding)
    })
    return groups
  }, [filteredFindings])

  // Auto-expand all targets on first load
  useMemo(() => {
    const allTargets = Object.keys(groupedFindings).reduce((acc, target) => {
      acc[target] = true
      return acc
    }, {} as Record<string, boolean>)
    setExpandedTargets(allTargets)
  }, [groupedFindings])

  const toggleTarget = (target: string) => {
    setExpandedTargets(prev => ({
      ...prev,
      [target]: !prev[target]
    }))
  }

  const getTargetSeverityCounts = (findings: Finding[]) => {
    return {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
    }
  }

  function getSeverityBadge(severity: string) {
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

  function getStateBadge(state: string) {
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

  function renderFinding(finding: Finding, index: number) {
    return (
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
                    {Math.round(finding.ai_reasoning.confidence_score)}% AI confidence
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">{finding.description}</p>
              {finding.scan && !groupByTarget && (
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
              {finding.scan && groupByTarget && (
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span className="font-medium">Scan:</span> {finding.scan.name}
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
    )
  }

  return (
    <>
      <FindingsFilters onFilterChange={setFilters} />

      {/* Results Summary & View Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing <span className="text-white font-semibold">{filteredFindings.length}</span> of{' '}
          <span className="text-white font-semibold">{initialFindings.length}</span> findings
          {filters.search && (
            <span> matching "<span className="text-blue-400">{filters.search}</span>"</span>
          )}
          {groupByTarget && (
            <span> across <span className="text-white font-semibold">{Object.keys(groupedFindings).length}</span> targets</span>
          )}
        </p>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setGroupByTarget(false)}
            variant={!groupByTarget ? "default" : "outline"}
            size="sm"
            className={!groupByTarget ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "border-gray-600 text-gray-300"}
          >
            <List className="h-4 w-4 mr-1" />
            List View
          </Button>
          <Button
            onClick={() => setGroupByTarget(true)}
            variant={groupByTarget ? "default" : "outline"}
            size="sm"
            className={groupByTarget ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "border-gray-600 text-gray-300"}
          >
            <Target className="h-4 w-4 mr-1" />
            By Target
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            {filters.search || filters.severities.length > 0 || filters.states.length > 0 ? 'Filtered Results' : 'All Findings'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {groupByTarget ? 'Findings grouped by scan target' : 'Click on any finding to view details and remediation steps'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFindings.length > 0 ? (
            groupByTarget ? (
              <div className="space-y-4">
                {Object.entries(groupedFindings).map(([target, findings]) => {
                  const counts = getTargetSeverityCounts(findings)
                  const isExpanded = expandedTargets[target]
                  
                  return (
                    <div key={target} className="border border-gray-700/50 rounded-lg overflow-hidden">
                      {/* Target Header */}
                      <div
                        onClick={() => toggleTarget(target)}
                        className="p-4 bg-gray-800/60 hover:bg-gray-800/80 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                          <Target className="h-5 w-5 text-blue-400" />
                          <div>
                            <h3 className="text-white font-semibold text-lg">{target}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{findings.length} findings</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {counts.critical > 0 && (
                            <Badge className="bg-red-500/20 text-red-300 border-red-500/50 border">
                              {counts.critical} Critical
                            </Badge>
                          )}
                          {counts.high > 0 && (
                            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50 border">
                              {counts.high} High
                            </Badge>
                          )}
                          {counts.medium > 0 && (
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 border">
                              {counts.medium} Medium
                            </Badge>
                          )}
                          {counts.low > 0 && (
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50 border">
                              {counts.low} Low
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Findings for this target */}
                      {isExpanded && (
                        <div className="p-3 space-y-2 bg-gray-900/30">
                          {findings.map((finding, index) => renderFinding(finding, index))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFindings.map((finding, index) => renderFinding(finding, index))}
              </div>
            )
          ) : (
            <div className="text-center py-16 text-gray-400">
              {initialFindings.length === 0 ? (
                <>
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
                </>
              ) : (
                <>
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-400 opacity-50" />
                  <p className="text-xl font-semibold text-white mb-2">No findings match your filters</p>
                  <p className="text-sm mb-4">Try adjusting your search criteria or filters</p>
                  <Button 
                    onClick={() => setFilters({ search: "", severities: [], states: [] })}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Clear All Filters
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
