"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"
import type { FindingSeverity, FindingState } from "@/lib/types/database"

interface FindingsFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  search: string
  severities: FindingSeverity[]
  states: FindingState[]
}

export default function FindingsFilters({ onFilterChange }: FindingsFiltersProps) {
  const [search, setSearch] = useState("")
  const [selectedSeverities, setSelectedSeverities] = useState<FindingSeverity[]>([])
  const [selectedStates, setSelectedStates] = useState<FindingState[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const severities: FindingSeverity[] = ['critical', 'high', 'medium', 'low', 'info']
  const states: FindingState[] = ['new', 'confirmed', 'false_positive', 'remediated', 'accepted_risk']

  const severityColors: Record<FindingSeverity, string> = {
    critical: "border-red-500/50 text-red-300 hover:bg-red-500/10",
    high: "border-orange-500/50 text-orange-300 hover:bg-orange-500/10",
    medium: "border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10",
    low: "border-blue-500/50 text-blue-300 hover:bg-blue-500/10",
    info: "border-gray-500/50 text-gray-300 hover:bg-gray-500/10"
  }

  const stateColors: Record<FindingState, string> = {
    new: "border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10",
    confirmed: "border-orange-500/50 text-orange-300 hover:bg-orange-500/10",
    false_positive: "border-gray-500/50 text-gray-300 hover:bg-gray-500/10",
    remediated: "border-green-500/50 text-green-300 hover:bg-green-500/10",
    accepted_risk: "border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
  }

  const toggleSeverity = (severity: FindingSeverity) => {
    const newSeverities = selectedSeverities.includes(severity)
      ? selectedSeverities.filter(s => s !== severity)
      : [...selectedSeverities, severity]
    
    setSelectedSeverities(newSeverities)
    onFilterChange({ search, severities: newSeverities, states: selectedStates })
  }

  const toggleState = (state: FindingState) => {
    const newStates = selectedStates.includes(state)
      ? selectedStates.filter(s => s !== state)
      : [...selectedStates, state]
    
    setSelectedStates(newStates)
    onFilterChange({ search, severities: selectedSeverities, states: newStates })
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onFilterChange({ search: value, severities: selectedSeverities, states: selectedStates })
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedSeverities([])
    setSelectedStates([])
    onFilterChange({ search: "", severities: [], states: [] })
  }

  const hasActiveFilters = search || selectedSeverities.length > 0 || selectedStates.length > 0

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search findings by title, description, or location..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between group">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <Filter className="h-4 w-4 mr-2 text-white group-hover:text-white" />
              <span className="text-white group-hover:text-white">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              {hasActiveFilters && !showFilters && (
                <Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/50">
                  {(selectedSeverities.length + selectedStates.length) || ''}
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t border-gray-700/50 animate-fade-in-up">
              {/* Severity Filter */}
              <div>
                <p className="text-sm font-semibold text-gray-300 mb-2">Severity</p>
                <div className="flex flex-wrap gap-2">
                  {severities.map((severity) => (
                    <Badge
                      key={severity}
                      onClick={() => toggleSeverity(severity)}
                      className={`cursor-pointer transition-all border ${
                        selectedSeverities.includes(severity)
                          ? severityColors[severity] + ' bg-opacity-20'
                          : 'border-gray-600 text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      {severity.toUpperCase()}
                      {selectedSeverities.includes(severity) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* State Filter */}
              <div>
                <p className="text-sm font-semibold text-gray-300 mb-2">State</p>
                <div className="flex flex-wrap gap-2">
                  {states.map((state) => (
                    <Badge
                      key={state}
                      onClick={() => toggleState(state)}
                      className={`cursor-pointer transition-all border ${
                        selectedStates.includes(state)
                          ? stateColors[state] + ' bg-opacity-20'
                          : 'border-gray-600 text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      {state.replace('_', ' ').toUpperCase()}
                      {selectedStates.includes(state) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
