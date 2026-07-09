'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Shield, Bug, Trash2, X } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface Report {
  id: string
  title: string
  type: string
  engagementId: string
  status: string
  createdAt: string
  updatedAt: string
}

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  review: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/10 text-green-400 border-green-500/30',
}

const typeIcons: Record<string, typeof Shield> = {
  pentest: Shield,
  'bug-bounty': Bug,
}

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('pentest')

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/reports')
      if (res.ok) {
        const data = await res.json()
        setReports(data)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const createReport = async () => {
    const title = newTitle.trim() || `New ${newType === 'pentest' ? 'Pentest' : 'Bug Bounty'} Report`
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type: newType }),
      })
      if (res.ok) {
        const report = await res.json()
        setReports([report, ...reports])
        setNewTitle('')
        setNewType('pentest')
        setShowCreate(false)
        router.push(`/reports/${report.id}`)
      }
    } catch (error) {
      console.error('Failed to create report:', error)
    }
  }

  const deleteReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setReports(reports.filter((r) => r.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete report:', error)
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
              <p className="text-sm text-muted-foreground mt-1">{reports.length} reports</p>
            </div>
            <Button onClick={() => setShowCreate(!showCreate)}>
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>

          {showCreate && (
            <Card className="p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Create Report</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-3">
                <Input
                  placeholder="Report title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && createReport()}
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="px-3 py-2 rounded-md border border-border bg-input text-sm text-foreground"
                >
                  <option value="pentest">Pentest</option>
                  <option value="bug-bounty">Bug Bounty</option>
                </select>
                <Button onClick={createReport}>Create</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">No reports yet</p>
              <p className="text-xs text-muted-foreground/60 mb-4">Create your first report to get started</p>
              <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Report
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => {
                const Icon = typeIcons[report.type] || FileText
                return (
                  <Card
                    key={report.id}
                    className="p-5 hover:shadow-card-hover hover:border-border/80 transition-all duration-200 cursor-pointer group"
                    onClick={() => router.push(`/reports/${report.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <h3 className="font-semibold truncate text-foreground">{report.title}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-7 w-7 p-0"
                        onClick={(e) => deleteReport(report.id, e)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-[11px] capitalize">
                        {report.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${statusColors[report.status] || ''}`}
                      >
                        {report.status?.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                      Updated {new Date(report.updatedAt).toLocaleDateString()}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
