'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Shield, ExternalLink } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Vulnerability {
  id: string
  title: string
  severity: string
  cvss: number
  cwe: string
  status: string
  createdAt: string
  updatedAt: string
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  info: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30',
}

const severityOrder = ['critical', 'high', 'medium', 'low', 'info']

export default function VulnerabilitiesPage() {
  const router = useRouter()
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchVulnerabilities = useCallback(async () => {
    try {
      const res = await fetch('/api/vulnerabilities')
      if (res.ok) {
        const data = await res.json()
        setVulnerabilities(data)
      }
    } catch (error) {
      console.error('Failed to fetch vulnerabilities:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVulnerabilities()
  }, [fetchVulnerabilities])

  const severityCounts = vulnerabilities.reduce((acc, vuln) => {
    acc[vuln.severity] = (acc[vuln.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const filteredVulnerabilities = vulnerabilities.filter((vuln) => {
    const matchesSearch =
      vuln.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vuln.cwe?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vuln.status?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = !severityFilter || vuln.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Vulnerabilities</h1>
              <p className="text-sm text-muted-foreground mt-1">{vulnerabilities.length} total vulnerabilities</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={severityFilter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSeverityFilter(null)}
            >
              All ({vulnerabilities.length})
            </Button>
            {severityOrder.map((severity) => (
              <Button
                key={severity}
                variant={severityFilter === severity ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSeverityFilter(severity)}
                className={severityColors[severity] || ''}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)} (
                {severityCounts[severity] || 0})
              </Button>
            ))}
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search vulnerabilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : filteredVulnerabilities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery || severityFilter
                  ? 'No vulnerabilities match your filters'
                  : 'No vulnerabilities found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVulnerabilities.map((vuln) => (
                <Card
                  key={vuln.id}
                  className="p-4 hover:shadow-card-hover hover:border-border/80 transition-all duration-200 cursor-pointer group"
                  onClick={() => router.push(`/vulnerabilities/${vuln.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${severityColors[vuln.severity] || ''}`}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {vuln.severity}
                    </Badge>
                    <Badge variant="secondary" className="text-[11px]">
                      {vuln.status}
                    </Badge>
                  </div>

                  <h3 className="font-semibold mb-2 line-clamp-2 text-foreground">{vuln.title}</h3>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    {vuln.cwe && (
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs">{vuln.cwe}</span>
                      </div>
                    )}
                    {vuln.cvss > 0 && (
                      <div className="flex items-center gap-1">
                        <span>CVSS: {vuln.cvss.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
