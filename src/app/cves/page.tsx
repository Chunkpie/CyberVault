'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, ExternalLink, Trash2, AlertTriangle } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

interface CVE {
  id: string
  cveId: string
  severity: string
  cvss: number
  description: string
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

export default function CVEsPage() {
  const [cves, setCves] = useState<CVE[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCveId, setNewCveId] = useState('')
  const [newSeverity, setNewSeverity] = useState('medium')
  const [newCvss, setNewCvss] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const fetchCVEs = useCallback(async () => {
    try {
      const res = await fetch('/api/cves')
      if (res.ok) {
        const data = await res.json()
        setCves(data)
      }
    } catch (error) {
      console.error('Failed to fetch CVEs:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCVEs()
  }, [fetchCVEs])

  const addCVE = async () => {
    if (!newCveId.trim()) return
    try {
      const res = await fetch('/api/cves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cveId: newCveId,
          severity: newSeverity,
          cvss: parseFloat(newCvss) || 0,
          description: newDescription,
        }),
      })
      if (res.ok) {
        const cve = await res.json()
        setCves([cve, ...cves])
        setNewCveId('')
        setNewCvss('')
        setNewDescription('')
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Failed to add CVE:', error)
    }
  }

  const deleteCVE = async (id: string) => {
    try {
      const res = await fetch(`/api/cves/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCves(cves.filter((c) => c.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete CVE:', error)
    }
  }

  const filteredCVEs = cves.filter(
    (cve) =>
      cve.cveId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cve.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">CVE Tracking</h1>
              <p className="text-sm text-muted-foreground mt-1">{cves.length} tracked CVEs</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add CVE
            </Button>
          </div>

          {showAddForm && (
            <Card className="p-5 mb-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Input
                  placeholder="CVE ID (e.g., CVE-2024-0001)"
                  value={newCveId}
                  onChange={(e) => setNewCveId(e.target.value)}
                />
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="px-3 py-2 rounded-md border border-border bg-input text-sm text-foreground"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="info">Info</option>
                </select>
                <Input
                  type="number"
                  placeholder="CVSS Score"
                  value={newCvss}
                  onChange={(e) => setNewCvss(e.target.value)}
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
              <div className="flex gap-4">
                <Textarea
                  placeholder="Description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button onClick={addCVE} className="shrink-0">
                  Add
                </Button>
              </div>
            </Card>
          )}

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search CVEs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : filteredCVEs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No CVEs match your search' : 'No CVEs tracked yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCVEs.map((cve) => (
                <Card key={cve.id} className="p-4 hover:border-border/80 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                        cve.severity === 'critical' ? 'text-red-400' :
                        cve.severity === 'high' ? 'text-orange-400' :
                        cve.severity === 'medium' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-sm">{cve.cveId}</span>
                          <Badge variant="outline" className={`text-[10px] ${severityColors[cve.severity] || ''}`}>
                            {cve.severity}
                          </Badge>
                          {cve.cvss > 0 && (
                            <Badge variant="secondary" className="text-[10px]">
                              CVSS: {cve.cvss.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{cve.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={`https://nvd.nist.gov/vuln/detail/${cve.cveId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => deleteCVE(cve.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </Button>
                    </div>
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
